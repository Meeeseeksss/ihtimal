import {
  Avatar,
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useCallback, useMemo, useState } from "react";

export type ChatUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type ChatMessage = {
  id: string;
  user: ChatUser;
  createdAt: number; // epoch ms
  body: string;
  likes: number;
  dislikes: number;
  replies?: ChatMessage[]; // one-level thread for UI (YouTube-style)
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clampLen(s: string, max = 280) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function makeLocalId(prefix: string) {
  const rand = Math.random().toString(16).slice(2);
  const time = Date.now().toString(16);
  return `${prefix}:${time}:${rand}`;
}

function updateMessageById(
  items: ChatMessage[],
  targetId: string,
  updater: (m: ChatMessage) => ChatMessage
): ChatMessage[] {
  return items.map((m) => (m.id === targetId ? updater(m) : m));
}

type MarketChatProps = {
  marketId: string;
  loading?: boolean;
};

type MessageRowProps = {
  msg: ChatMessage;
  compact?: boolean;
  onReply: (id: string) => void;
  onVote: (id: string, kind: "up" | "down") => void;
  onReport: (id: string) => void;
};

function MessageRow({ msg, compact = false, onReply, onVote, onReport }: MessageRowProps) {
  return (
    <Box sx={{ minWidth: 0, overflowX: "hidden" }}>
      <Stack direction="row" spacing={1.1} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Avatar
          src={msg.user.avatarUrl}
          sx={{
            width: compact ? 30 : 34,
            height: compact ? 30 : 34,
            fontSize: compact ? 12 : 13,
            fontWeight: 800,
            bgcolor: "rgba(0,0,0,0.08)",
            color: "text.primary",
            mt: 0.15,
            flex: "0 0 auto",
          }}
        >
          {initials(msg.user.name)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
          <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 850 }}>
              {msg.user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {fmtTime(msg.createdAt)}
            </Typography>

            {typeof msg.replies?.length === "number" && msg.replies.length > 0 ? (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 800, ml: "auto" }}
              >
                {msg.replies.length} replies
              </Typography>
            ) : null}
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mt: 0.35,
              color: "text.primary",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {msg.body}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mt: 0.5 }}>
            <Tooltip title="Like">
              <IconButton size="small" onClick={() => onVote(msg.id, "up")} aria-label="like">
                <ThumbUpOutlinedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: "text.secondary", minWidth: 18 }}>
              {msg.likes}
            </Typography>

            <Tooltip title="Downvote">
              <IconButton size="small" onClick={() => onVote(msg.id, "down")} aria-label="downvote">
                <ThumbDownOutlinedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: "text.secondary", minWidth: 18 }}>
              {msg.dislikes}
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Tooltip title="Replies">
              <IconButton size="small" onClick={() => onReply(msg.id)} aria-label="reply">
                <ReplyRoundedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Report">
              <IconButton size="small" onClick={() => onReport(msg.id)} aria-label="report">
                <FlagOutlinedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

type ThreadDialogProps = {
  open: boolean;
  loading: boolean;
  parent: ChatMessage | null;

  replyDraft: string;
  onReplyDraftChange: (v: string) => void;

  onClose: () => void;
  onPostReply: () => void;

  onVote: (id: string, kind: "up" | "down") => void;
  onReport: (id: string) => void;
};

function ThreadDialog({
  open,
  loading,
  parent,
  replyDraft,
  onReplyDraftChange,
  onClose,
  onPostReply,
  onVote,
  onReport,
}: ThreadDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const canReply = replyDraft.trim().length > 0 && !loading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={onClose} aria-label="back">
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Replies
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        {parent ? (
          <MessageRow msg={parent} compact onReply={() => {}} onVote={onVote} onReport={onReport} />
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Thread not found.
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Replies list (scrolls only here) */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          overflowX: "hidden",
          p: 2,
          display: "grid",
          gap: 1.25,
        }}
      >
        {(parent?.replies ?? []).length ? (
          parent!.replies!.map((r) => (
            <MessageRow
              key={r.id}
              msg={r}
              compact
              onReply={() => {}}
              onVote={onVote}
              onReport={onReport}
            />
          ))
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No replies yet. Be the first.
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Reply composer */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={1}>
          <TextField
            value={replyDraft}
            onChange={(e) => onReplyDraftChange(e.target.value)}
            placeholder="Add a reply…"
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            disabled={loading || !parent}
            inputProps={{ maxLength: 400 }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onPostReply} disabled={!canReply || !parent}>
              Reply
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}

/**
 * UI-only market chat (YouTube-style threads).
 * - Main list: top-level comments only
 * - Replies: open a dialog "page" (full-screen on mobile)
 * - No horizontal scrolling: wrap + overflowX hidden everywhere
 */
export function MarketChat({ marketId, loading = false }: MarketChatProps) {
  const seed = useMemo<ChatMessage[]>(
    () => [
      {
        id: `${marketId}:m1`,
        user: { id: "u1", name: "Maya K." },
        createdAt: Date.now() - 1000 * 60 * 18,
        body: "Volume’s picking up fast — watch the spread tighten near close.",
        likes: 12,
        dislikes: 1,
        replies: [
          {
            id: `${marketId}:m1:r1`,
            user: { id: "u2", name: "Rami S." },
            createdAt: Date.now() - 1000 * 60 * 12,
            body: "Agreed. I’m waiting for a better YES entry around 44–46¢.",
            likes: 4,
            dislikes: 0,
          },
        ],
      },
      {
        id: `${marketId}:m2`,
        user: { id: "u3", name: "Nour A." },
        createdAt: Date.now() - 1000 * 60 * 8,
        body: "Reminder: read the rules — edge cases can flip the whole trade.",
        likes: 9,
        dislikes: 0,
        replies: [],
      },
    ],
    [marketId]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(seed);
  const [draft, setDraft] = useState("");

  // Thread “page”
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadDraft, setThreadDraft] = useState("");

  const threadParent = useMemo(
    () => (threadId ? messages.find((m) => m.id === threadId) ?? null : null),
    [messages, threadId]
  );

  const canPost = draft.trim().length > 0 && !loading;

  const postMessage = useCallback(() => {
    const body = clampLen(draft, 400);
    if (!body) return;

    const newMsg: ChatMessage = {
      id: makeLocalId(`${marketId}:local`),
      user: { id: "me", name: "You" },
      createdAt: Date.now(),
      body,
      likes: 0,
      dislikes: 0,
      replies: [],
    };

    setMessages((prev) => [newMsg, ...prev]);
    setDraft("");
  }, [draft, marketId]);

  const openThread = useCallback((id: string) => {
    setThreadId(id);
    setThreadDraft("");
  }, []);

  const closeThread = useCallback(() => {
    setThreadId(null);
    setThreadDraft("");
  }, []);

  const postThreadReply = useCallback(() => {
    if (!threadId) return;
    const body = clampLen(threadDraft, 300);
    if (!body) return;

    const rep: ChatMessage = {
      id: makeLocalId(`${marketId}:local`),
      user: { id: "me", name: "You" },
      createdAt: Date.now(),
      body,
      likes: 0,
      dislikes: 0,
    };

    setMessages((prev) =>
      updateMessageById(prev, threadId, (m) => ({
        ...m,
        replies: [rep, ...(m.replies ?? [])],
      }))
    );

    setThreadDraft("");
  }, [threadDraft, marketId, threadId]);

  const vote = useCallback((targetId: string, kind: "up" | "down") => {
    // votes can hit either parent or reply (within current thread)
    const applyVote = (m: ChatMessage): ChatMessage => {
      if (m.id === targetId) {
        return {
          ...m,
          likes: kind === "up" ? m.likes + 1 : m.likes,
          dislikes: kind === "down" ? m.dislikes + 1 : m.dislikes,
        };
      }
      return m;
    };

    setMessages((prev) =>
      prev.map((m) => {
        const updatedParent = applyVote(m);
        const updatedReplies = (updatedParent.replies ?? []).map(applyVote);
        return { ...updatedParent, replies: updatedReplies };
      })
    );
  }, []);

  const report = useCallback((targetId: string) => {
    // UI-only: backend will wire moderation later.
    // eslint-disable-next-line no-console
    console.log("Report message", targetId);
  }, []);

  return (
    <>
      <Paper
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflowX: "hidden",
        }}
      >
        <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflowX: "hidden" }}>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ minWidth: 0 }}>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="h6">Chat</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Discuss this market. Keep it factual.
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
              {messages.length} posts
            </Typography>
          </Stack>

          <Divider />

          {/* Composer */}
          <Stack spacing={1} sx={{ overflowX: "hidden" }}>
            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share an insight…"
              multiline
              minRows={2}
              maxRows={6}
              fullWidth
              disabled={loading}
              inputProps={{ maxLength: 600 }}
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                UI-only for now. Backend coming later.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={postMessage}
                disabled={!canPost}
                endIcon={<SendRoundedIcon />}
                sx={{ borderRadius: 2 }}
              >
                Post
              </Button>
            </Stack>
          </Stack>

          <Divider />

          {/* Only this area scrolls (vertical only) */}
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              overflowX: "hidden",
              pr: 0.5,
            }}
          >
            {messages.map((m) => (
              <MessageRow
                key={m.id}
                msg={m}
                onReply={openThread}
                onVote={vote}
                onReport={report}
              />
            ))}
          </Box>
        </Stack>
      </Paper>

      {/* Thread "new page" */}
      <ThreadDialog
        open={Boolean(threadId)}
        loading={loading}
        parent={threadParent}
        replyDraft={threadDraft}
        onReplyDraftChange={setThreadDraft}
        onClose={closeThread}
        onPostReply={postThreadReply}
        onVote={vote}
        onReport={report}
      />
    </>
  );
}
