import {
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNotify } from "../app/notifications";

type ProfileForm = {
  displayName: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  exp: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack spacing={1.25}>
        <Box>
          <Typography variant="subtitle1" fontWeight={900}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          ) : null}
        </Box>

        {children}
      </Stack>
    </Paper>
  );
}

function defer(fn: () => void) {
  if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
    window.requestAnimationFrame(() => fn());
  } else {
    setTimeout(fn, 0);
  }
}

export function ProfilePage() {
  const notify = useNotify();

  const [profile, setProfile] = useState<ProfileForm>({
    displayName: "Armen",
    username: "@armen",
    bio: "",
    email: "armen@example.com",
    phone: "",
  });

  const [password, setPassword] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [payments, setPayments] = useState<PaymentMethod[]>([
    { id: "pm_1", brand: "Visa", last4: "4242", exp: "12/28" },
  ]);

  const passwordError = useMemo(() => {
    if (!password.currentPassword && !password.newPassword && !password.confirmNewPassword)
      return "";
    if (!password.currentPassword) return "Enter your current password";
    if (password.newPassword.length < 8) return "New password must be at least 8 characters";
    if (password.newPassword !== password.confirmNewPassword) return "Passwords do not match";
    return "";
  }, [password]);

  const emailError = useMemo(() => {
    if (!profile.email) return "Email is required";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
      ? ""
      : "Enter a valid email";
  }, [profile.email]);

  const phoneHint = useMemo(() => {
    if (!profile.phone) return "";
    const trimmed = profile.phone.trim();
    if (trimmed.length < 7) return "Phone number looks too short";
    return "";
  }, [profile.phone]);

  const saveAll = () => {
    defer(() => notify({ severity: "success", message: "Saved (UI only)" }));
  };

  const submitPersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    defer(() => notify({ severity: "info", message: "Saved personal info (UI only)" }));
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      defer(() => notify({ severity: "error", message: emailError }));
      return;
    }
    defer(() => notify({ severity: "success", message: "Updated contact info (UI only)" }));
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError) {
      defer(() => notify({ severity: "error", message: passwordError }));
      return;
    }
    defer(() => notify({ severity: "success", message: "Password updated (UI only)" }));
    setPassword({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", pb: 4 }}>
      <Stack spacing={2.25}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 44,
                height: 44,
                border: "1px solid",
                borderColor: "divider",
                fontWeight: 900,
              }}
            >
              {profile.displayName?.slice(0, 1)?.toUpperCase() || "U"}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your account, security, and payout methods.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            disableElevation
            onClick={saveAll}
            sx={{ borderRadius: 999, height: 40, px: 2.5, fontWeight: 900 }}
          >
            Save changes
          </Button>
        </Stack>

        <Divider />

        {/* Layout */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <Stack spacing={2}>
            <Section title="Personal information" description="Update your public profile details.">
              <Box component="form" noValidate onSubmit={submitPersonalInfo}>
                <Stack spacing={1.25}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.25,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    }}
                  >
                    <TextField
                      label="Display name"
                      value={profile.displayName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, displayName: e.target.value }))
                      }
                      size="small"
                      fullWidth
                      autoComplete="name"
                    />
                    <TextField
                      label="Username"
                      value={profile.username}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, username: e.target.value }))
                      }
                      size="small"
                      fullWidth
                      autoComplete="username"
                    />
                  </Box>

                  <TextField
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    size="small"
                    multiline
                    minRows={3}
                    placeholder="Tell people what you trade and why"
                    fullWidth
                  />

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="outlined"
                      sx={{ borderRadius: 999, height: 38, px: 2, fontWeight: 900 }}
                    >
                      Save
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Section>

            <Section
              title="Login & contact"
              description="Change email and add a phone number for security."
            >
              <Box component="form" noValidate onSubmit={submitContact}>
                <Stack spacing={1.25}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.25,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    }}
                  >
                    <TextField
                      label="Email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      size="small"
                      error={Boolean(emailError)}
                      helperText={emailError || " "}
                      fullWidth
                      autoComplete="email"
                      inputMode="email"
                    />

                    <TextField
                      label="Phone"
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      size="small"
                      placeholder="+961 ..."
                      error={Boolean(phoneHint)}
                      helperText={phoneHint || " "}
                      fullWidth
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </Box>

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="outlined"
                      sx={{ borderRadius: 999, height: 38, px: 2, fontWeight: 900 }}
                    >
                      Update
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Section>

            <Section
              title="Security"
              description="Change your password regularly to keep your account safe."
            >
              <Box component="form" noValidate onSubmit={submitPassword}>
                <Stack spacing={1.25}>
                  {/* ✅ Hidden username/email field for password manager + accessibility */}
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={profile.email || profile.username || ""}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 1,
                      height: 1,
                      overflow: "hidden",
                      pointerEvents: "none",
                    }}
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.25,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    }}
                  >
                    <TextField
                      label="Current password"
                      type="password"
                      value={password.currentPassword}
                      onChange={(e) =>
                        setPassword((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      size="small"
                      fullWidth
                      autoComplete="current-password"
                    />
                    <Box />

                    <TextField
                      label="New password"
                      type="password"
                      value={password.newPassword}
                      onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))}
                      size="small"
                      fullWidth
                      autoComplete="new-password"
                    />
                    <TextField
                      label="Confirm new password"
                      type="password"
                      value={password.confirmNewPassword}
                      onChange={(e) =>
                        setPassword((p) => ({ ...p, confirmNewPassword: e.target.value }))
                      }
                      size="small"
                      fullWidth
                      autoComplete="new-password"
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: passwordError ? "error.main" : "text.secondary",
                      minHeight: 18,
                    }}
                  >
                    {passwordError || "Use at least 8 characters."}
                  </Typography>

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      disableElevation
                      sx={{ borderRadius: 999, height: 38, px: 2, fontWeight: 900 }}
                    >
                      Change password
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Section>
          </Stack>

          {/* Right column */}
          <Stack spacing={2}>
            <Section
              title="Payment methods"
              description="Add a card for deposits and withdrawals (UI-only placeholder)."
            >
              <Stack spacing={1.25}>
                {payments.map((pm) => (
                  <Box
                    key={pm.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      px: 1.75,
                      py: 1.25,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900} sx={{ fontSize: 14 }}>
                        {pm.brand} •••• {pm.last4}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires {pm.exp}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          defer(() => notify({ severity: "info", message: "Edit card (UI only)" }))
                        }
                        sx={{ borderRadius: 999, height: 34, px: 1.5, fontWeight: 900 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setPayments((prev) => prev.filter((x) => x.id !== pm.id));
                          defer(() =>
                            notify({ severity: "warning", message: "Removed card (UI only)" })
                          );
                        }}
                        sx={{ borderRadius: 999, height: 34, px: 1.5, fontWeight: 900 }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                ))}

                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    const id = `pm_${Math.random().toString(16).slice(2, 8)}`;
                    setPayments((prev) => [
                      ...prev,
                      { id, brand: "Mastercard", last4: "1111", exp: "01/29" },
                    ]);
                    defer(() =>
                      notify({ severity: "success", message: "Added payment method (UI only)" })
                    );
                  }}
                  sx={{
                    borderRadius: 999,
                    height: 38,
                    px: 2,
                    fontWeight: 900,
                    alignSelf: "flex-start",
                  }}
                >
                  Add payment method
                </Button>

                <Typography variant="caption" color="text.secondary">
                  We’ll plug this into the backend later (Stripe, etc.).
                </Typography>
              </Stack>
            </Section>

            <Section title="Account" description="Quick actions and status.">
              <Stack spacing={1.25}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.75,
                  }}
                >
                  <Typography fontWeight={900} sx={{ fontSize: 14 }}>
                    Verification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Not verified (UI-only)
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  onClick={() =>
                    defer(() =>
                      notify({ severity: "info", message: "Start verification (UI only)" })
                    )
                  }
                  sx={{
                    borderRadius: 999,
                    height: 38,
                    px: 2,
                    fontWeight: 900,
                    alignSelf: "flex-start",
                  }}
                >
                  Start verification
                </Button>

                <Divider />

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    defer(() => notify({ severity: "warning", message: "Logout (UI only)" }))
                  }
                  sx={{
                    borderRadius: 999,
                    height: 38,
                    px: 2,
                    fontWeight: 900,
                    alignSelf: "flex-start",
                  }}
                >
                  Log out
                </Button>
              </Stack>
            </Section>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
