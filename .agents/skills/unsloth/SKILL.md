---
name: unsloth
description: >-
  Use this skill when training, fine-tuning, evaluating, or running local inference with LLMs
  using Unsloth (https://github.com/unslothai/unsloth). Includes fast QLoRA/LoRA recipes,
  GRPO reasoning alignment, GGUF exports, and scripts located in E:\projects-personal\unsloth.
---

# Unsloth AI · Fast LLM Fine-Tuning & Inference Engine

Unsloth is the open-source engine for ultra-fast, memory-efficient LLM fine-tuning (2.2x faster training, 80% less VRAM usage).

The local repository is cloned and available at:
📁 **`E:\projects-personal\unsloth`**

---

## 1. Supported Models & Quantization

Unsloth provides pre-quantized 4-bit and 16-bit base weights for:
- **Llama 3.1 & 3.2** (1B, 3B, 8B, 70B)
- **Gemma 2** (2B, 9B, 27B)
- **Mistral & Mixtral** (7B, 8x7B, 8x22B)
- **Qwen 2.5** (0.5B to 72B, Coder & Math)
- **DeepSeek R1 / V3 Distills** (Llama & Qwen variants)
- **Phi-3.5 & Phi-4**

---

## 2. Standard Fine-Tuning Recipe (QLoRA)

### Python Script: `train_unsloth.py`
```python
from unsloth import FastLanguageModel
import torch
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

max_seq_length = 2048 # Supports RoPE scaling automatically
dtype = None # Auto detects Float16 or Bfloat16
load_in_4bit = True # 4bit quantization to save 80% VRAM

# 1. Load Model & Tokenizer
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Meta-Llama-3.1-8B-bnb-4bit",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

# 2. Add LoRA Adapters (Only 1-3% of parameters trained)
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # Rank: 8, 16, 32, 64
    target_modules = [
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
    lora_alpha = 16,
    lora_dropout = 0, # Optimized = 0
    bias = "none",    # Optimized = "none"
    use_gradient_checkpointing = "unsloth", # 30% less VRAM
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)

# 3. Format Training Dataset
prompt_template = """Below is an instruction that describes a task. Write a response that appropriately completes the request.

### Instruction:
{}

### Response:
{}"""

def formatting_prompts_func(examples):
    instructions = examples["instruction"]
    outputs      = examples["output"]
    texts = []
    for instruction, output in zip(instructions, outputs):
        text = prompt_template.format(instruction, output) + tokenizer.eos_token
        texts.append(text)
    return { "text" : texts }

dataset = load_dataset("yahma/alpaca-cleaned", split = "train")
dataset = dataset.map(formatting_prompts_func, batched = True)

# 4. Train with SFTTrainer
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False, # Can speed up training 5x for short sequences
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 60,
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
    ),
)

trainer_stats = trainer.train()
```

---

## 3. Fast Inference (2x Speedup)

```python
# Enable native fast inference mode
FastLanguageModel.for_inference(model)

inputs = tokenizer(
    [
        prompt_template.format(
            "What are the top three safety rules when riding in a motorcycle pack formation?",
            "",
        )
    ],
    return_tensors = "pt"
).to("cuda")

outputs = model.generate(**inputs, max_new_tokens = 256, use_cache = True)
print(tokenizer.batch_decode(outputs, skip_special_tokens = True)[0])
```

---

## 4. Exporting Models

### A. Export to GGUF (for Ollama / llama.cpp)
```python
# Save quantized GGUF directly (e.g., q4_k_m, q8_0, f16)
model.save_pretrained_gguf("motosync_model_gguf", tokenizer, quantization_method = "q4_k_m")
```

### B. Push LoRA or Merged Weights to Hugging Face
```python
# Push only the lightweight LoRA adapter (100MB)
model.push_to_hub_merged("user/motosync-llama3-lora", tokenizer, save_method = "lora", token = "YOUR_HF_TOKEN")

# Push 16-bit merged full model
model.push_to_hub_merged("user/motosync-llama3-16bit", tokenizer, save_method = "merged_16bit", token = "YOUR_HF_TOKEN")
```

---

## 5. Local Tools in `E:\projects-personal\unsloth`

- **CLI Interface:** `python E:\projects-personal\unsloth\unsloth-cli.py`
- **Subagent MCP Tools:**
  - `E:\projects-personal\unsloth\unsloth_cli\claude_subagent_mcp.py`
  - `E:\projects-personal\unsloth\unsloth_cli\codex_subagent_mcp.py`
- **Studio Interface:** `E:\projects-personal\unsloth\studio\`
