import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Colors,
  Spacing,
  Radii,
  Typography,
  TouchTargets,
} from "@/theme/tokens";
import { PrimaryButton, SecondaryButton, Skeleton } from "@/components/ui";
import { useRiderSession } from "@/context/RiderSession";
import { supabase } from "@/lib/supabase";
import { riderRequest } from "@/lib/riderApi";

type Row = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  body?: string;
  city?: string;
  privacy?: string;
  member_count?: number;
  start_time?: string;
  meetup_label?: string;
  route_summary?: string;
  status?: string;
  amount?: number;
  currency?: string;
  split_count?: number;
  per_rider_share?: number;
  club_id?: string;
  ride_id?: string;
  role?: string;
  formation_role?: string;
  message_text?: string;
  created_at?: string;
  publish_at?: string;
  rides?: Row | null;
  clubs?: Row | null;
};
type Screen = "home" | "discover" | "pack" | "splits";
const titles: Record<Screen, string> = {
  home: "Your next ride",
  discover: "Find your community",
  pack: "Your pack",
  splits: "Ride expenses",
};
const copy: Record<Screen, string> = {
  home: "Explore rides and announcements from your community.",
  discover: "Discover groups, join your people and start a conversation.",
  pack: "Your memberships and ride RSVPs, together.",
  splits: "Recorded expenses for the rides you can access.",
};
const date = (value?: string) =>
  value ? new Date(value).toLocaleString() : "";
function Loading() {
  return (
    <View style={styles.stack}>
      {[0, 1, 2].map((n) => (
        <View style={styles.card} key={n}>
          <Skeleton width="65%" />
          <Skeleton />
          <Skeleton width="80%" />
        </View>
      ))}
    </View>
  );
}

export function LiveRiderScreen({ screen }: { screen: Screen }) {
  const { session, ready } = useRiderSession();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [authError, setAuthError] = useState(""),
    [busy, setBusy] = useState(false);
  async function signIn() {
    if (!supabase) return;
    setBusy(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setPassword("");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.page}
      >
        <Text style={styles.brand}>MOTOSYNC</Text>
        <Text style={styles.heading}>{titles[screen]}</Text>
        <Text style={styles.body}>{copy[screen]}</Text>
        {!ready ? (
          <Loading />
        ) : !supabase ? (
          <View style={styles.card}>
            <Text style={styles.title}>Connection setup required</Text>
            <Text style={styles.body}>
              Configure the EXPO_PUBLIC API URL and Supabase public credentials,
              then rebuild.
            </Text>
          </View>
        ) : !session ? (
          <View style={styles.card}>
            <Text style={styles.title}>Sign in as a rider</Text>
            <Text style={styles.body}>
              Use your rider account. Administrator accounts are managed
              separately.
            </Text>
            <TextInput
              accessibilityLabel="Email"
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <TextInput
              accessibilityLabel="Password"
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              autoComplete="current-password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            {!!authError && (
              <Text accessibilityRole="alert" style={styles.error}>
                {authError}
              </Text>
            )}
            <PrimaryButton
              title="Sign in"
              loading={busy}
              disabled={!email.trim() || !password}
              onPress={signIn}
            />
          </View>
        ) : (
          <AuthenticatedScreen key={session.user.id + screen} screen={screen} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function AuthenticatedScreen({ screen }: { screen: Screen }) {
  const { session } = useRiderSession(),
    cache = useQueryClient();
  const [chat, setChat] = useState<Row | null>(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const me = useQuery({
    queryKey: ["rider", session?.user.id, "me"],
    queryFn: () => riderRequest<Row>("rider/me"),
  });
  async function action(
    operation: string,
    target_id: string,
    message?: string,
  ) {
    setBusy(true);
    setNotice("");
    try {
      await riderRequest("rider/actions", { operation, target_id, message });
      await cache.invalidateQueries({
        queryKey: ["rider"],
        refetchType: "none",
      });
      setNotice("Saved. Refresh the list to see the latest data.");
      return true;
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Could not save. Please retry.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (me.isPending) return <Loading />;
  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        <Text style={styles.body}>{session?.user.email}</Text>
        <SecondaryButton
          title="Sign out"
          onPress={async () => {
            const result = await supabase?.auth.signOut();
            if (result?.error) setNotice(result.error.message);
          }}
        />
      </View>
      {me.error ? (
        <View style={styles.card}>
          <Text accessibilityRole="alert" style={styles.error}>
            {me.error.message}
          </Text>
          <SecondaryButton title="Retry" onPress={() => me.refetch()} />
        </View>
      ) : (
        <>
          {!!notice && (
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              {notice}
            </Text>
          )}
          {screen === "home" && (
            <>
              <Feed
                kind="announcements"
                title="Announcements"
                render={(r) => (
                  <>
                    <Text style={styles.title}>{r.title}</Text>
                    <Text style={styles.body}>{r.body}</Text>
                    <Text style={styles.body}>{date(r.publish_at)}</Text>
                  </>
                )}
              />
              <Feed
                kind="rides"
                title="Ride calendar"
                render={(r) => (
                  <>
                    <Ride row={r} />
                    {r.status === "upcoming" &&
                      Date.parse(r.start_time || "") > Date.now() && (
                        <PrimaryButton
                          title="RSVP to ride"
                          disabled={busy}
                          onPress={() => action("join_ride", r.id)}
                        />
                      )}
                  </>
                )}
              />
            </>
          )}
          {screen === "discover" && (
            <Feed
              kind="clubs"
              title="Groups & clubs"
              render={(r) => (
                <>
                  <Text style={styles.title}>{r.name}</Text>
                  <Text numberOfLines={2} style={styles.body}>
                    {r.description || "Ride together with this community."}
                  </Text>
                  <Text style={styles.body}>
                    {r.city} · {r.member_count ?? 0} members · {r.privacy}
                  </Text>
                  <View style={styles.row}>
                    <PrimaryButton
                      title="Join group"
                      disabled={busy}
                      onPress={() => action("join_club", r.id)}
                    />
                    <SecondaryButton
                      title="Open chat"
                      onPress={() => setChat(r)}
                    />
                  </View>
                </>
              )}
            />
          )}
          {screen === "pack" && (
            <>
              <Feed
                kind="memberships"
                title="Your groups"
                render={(r) => (
                  <>
                    <Text style={styles.title}>
                      {r.clubs?.name || "Group unavailable"}
                    </Text>
                    <Text style={styles.body}>{r.role}</Text>
                    <View style={styles.row}>
                      <PrimaryButton
                        title="Group chat"
                        onPress={() => r.clubs && setChat(r.clubs)}
                      />
                      <SecondaryButton
                        title="Leave group"
                        disabled={busy}
                        onPress={() =>
                          r.club_id && action("leave_club", r.club_id)
                        }
                      />
                    </View>
                  </>
                )}
              />
              <Feed
                kind="my-rides"
                title="Your rides"
                render={(r) => (
                  <>
                    <Ride row={r.rides || r} />
                    <Text style={styles.body}>{r.formation_role}</Text>
                    <SecondaryButton
                      title="Cancel RSVP"
                      disabled={busy}
                      onPress={() =>
                        r.ride_id && action("leave_ride", r.ride_id)
                      }
                    />
                  </>
                )}
              />
              <View style={styles.card}>
                <Text style={styles.title}>Live radar & intercom</Text>
                <Text style={styles.body}>
                  Not available yet. No live location or voice connection is
                  active.
                </Text>
              </View>
            </>
          )}
          {screen === "splits" && (
            <>
              <Feed
                kind="expenses"
                title="Expense records"
                render={(r) => (
                  <>
                    <Text style={styles.title}>{r.title}</Text>
                    <Text style={styles.body}>{r.rides?.title}</Text>
                    <Text style={styles.title}>
                      {r.currency} {Number(r.amount).toFixed(2)}
                    </Text>
                    <Text style={styles.body}>
                      {r.split_count} shares · {r.currency}{" "}
                      {Number(r.per_rider_share).toFixed(2)} per share
                    </Text>
                  </>
                )}
              />
              <Text style={styles.body}>
                Expense records are not payment confirmations. Settlement and
                receipt scanning are not available yet.
              </Text>
            </>
          )}
          {chat && (
            <View style={styles.card}>
              <SecondaryButton
                title="Close chat"
                onPress={() => setChat(null)}
              />
              <Chat key={chat.id} club={chat} action={action} busy={busy} />
            </View>
          )}
        </>
      )}
    </View>
  );
}
function Ride({ row }: { row: Row }) {
  return (
    <>
      <Text style={styles.title}>{row.title}</Text>
      <Text style={styles.body}>{row.route_summary}</Text>
      <Text style={styles.body}>{date(row.start_time)}</Text>
      <Text style={styles.body}>
        {row.meetup_label} · {row.status}
      </Text>
    </>
  );
}
function Feed({
  kind,
  title,
  render,
  path,
}: {
  kind: string;
  title: string;
  render: (row: Row) => React.ReactNode;
  path?: string;
}) {
  const { session } = useRiderSession(),
    [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["rider", session?.user.id, kind, path, page],
    queryFn: async () => {
      const data = await riderRequest<Row[]>(
        `${path || `rider/feed/${kind}`}?page=${page}`,
      );
      if (!Array.isArray(data)) throw new Error("Invalid feed response");
      return data;
    },
  });
  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <SecondaryButton
          title="Refresh"
          disabled={query.isFetching}
          onPress={() => query.refetch()}
        />
      </View>
      {query.isFetching ? (
        <Loading />
      ) : query.error ? (
        <View style={styles.card}>
          <Text accessibilityRole="alert" style={styles.error}>
            {query.error.message}
          </Text>
          <SecondaryButton title="Retry" onPress={() => query.refetch()} />
        </View>
      ) : !query.data?.length ? (
        <View style={styles.card}>
          <Text style={styles.body}>No records on this page.</Text>
        </View>
      ) : (
        query.data.map((r, i) => (
          <View style={styles.card} key={r.id || r.club_id || r.ride_id || i}>
            {render(r)}
          </View>
        ))
      )}
      <View style={styles.row}>
        <SecondaryButton
          title="Previous"
          disabled={page === 1 || query.isFetching}
          onPress={() => setPage((p) => p - 1)}
        />
        <Text style={styles.body}>Page {page}</Text>
        <SecondaryButton
          title="Next"
          disabled={query.isFetching || !query.data || query.data.length < 25}
          onPress={() => setPage((p) => p + 1)}
        />
      </View>
    </View>
  );
}
function Chat({
  club,
  action,
  busy,
}: {
  club: Row;
  action: (operation: string, id: string, message?: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [message, setMessage] = useState("");
  return (
    <View style={styles.stack}>
      <Feed
        kind="chat"
        path={`rider/clubs/${club.id}/messages`}
        title={club.name || "Group chat"}
        render={(r) => (
          <>
            <Text style={styles.body}>{r.message_text}</Text>
            <Text style={styles.body}>{date(r.created_at)}</Text>
          </>
        )}
      />
      <TextInput
        accessibilityLabel="Message to group"
        value={message}
        onChangeText={setMessage}
        placeholder="Message your group"
        placeholderTextColor={Colors.textSecondary}
        multiline
        maxLength={2000}
        style={styles.input}
      />
      <PrimaryButton
        title="Send message"
        disabled={!message.trim() || busy}
        onPress={async () => {
          if (await action("message", club.id, message)) setMessage("");
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  page: {
    padding: Spacing.xl,
    paddingBottom: TouchTargets.tabBarHeight + Spacing.huge,
    gap: Spacing.lg,
  },
  brand: { ...Typography.headline, color: Colors.blue },
  heading: Typography.hero,
  title: Typography.title,
  body: Typography.body,
  error: { ...Typography.body, color: Colors.red },
  stack: { gap: Spacing.lg },
  card: {
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radii.sm,
    minHeight: TouchTargets.minTouch,
    padding: Spacing.md,
  },
});
