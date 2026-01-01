import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useMemo, useState } from "react";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

const COUNTRIES = [
  "Lebanon",
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "UAE",
  "Saudi Arabia",
  "Canada",
  "Australia",
  "Other",
];

type FormState = {
  firstName: string;
  lastName: string;
  fatherName: string;
  age: string; // keep as string for input
  email: string;
  phone: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type TouchedState = Partial<Record<keyof FormState, boolean>>;

export function SignupPage() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    fatherName: "",
    age: "",
    email: "",
    phone: "",
    country: "Lebanon",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Track which fields should show validation UI
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const markTouched = (key: keyof FormState) =>
    setTouched((p) => ({ ...p, [key]: true }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    const ageNum = Number(form.age);

    // Required
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.fatherName.trim()) e.fatherName = "Required";

    if (!form.age.trim()) e.age = "Required";
    else if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 120)
      e.age = "Age must be between 18 and 120";

    if (!form.email.trim()) e.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";

    if (!form.phone.trim()) e.phone = "Required";
    if (!form.country.trim()) e.country = "Required";
    if (!form.addressLine1.trim()) e.addressLine1 = "Required";
    if (!form.city.trim()) e.city = "Required";

    if (!form.password) e.password = "Required";
    else if (form.password.length < 8) e.password = "Min 8 characters";

    if (!form.confirmPassword) e.confirmPassword = "Required";
    else if (form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match";

    if (!form.acceptTerms) e.acceptTerms = "You must accept terms";

    return e;
  }, [form]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const showError = (key: keyof FormState) => {
    // Only show red/error after submit attempt OR after user touched the field
    return (submitAttempted || touched[key]) && !!errors[key];
  };

  const helper = (key: keyof FormState, fallback?: string) => {
    if (showError(key)) return errors[key];
    return fallback ?? "";
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!canSubmit) {
      // mark all fields that currently have errors as touched
      const nextTouched: TouchedState = { ...touched };
      (Object.keys(errors) as (keyof FormState)[]).forEach((k) => {
        nextTouched[k] = true;
      });
      setTouched(nextTouched);
      return;
    }

    console.log("signup", form);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 6,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 920,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Create your account
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Fields marked with <b>*</b> are required.
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {/* Identity */}
            <TextField
              label="First name *"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              onBlur={() => markTouched("firstName")}
              error={showError("firstName")}
              helperText={helper("firstName")}
            //   InputProps={{
            //     startAdornment: (
            //       <InputAdornment position="start">
            //         <PersonOutlinedIcon fontSize="small" />
            //       </InputAdornment>
            //     ),
            //   }}
            />

            <TextField
              label="Last name *"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              onBlur={() => markTouched("lastName")}
              error={showError("lastName")}
              helperText={helper("lastName")}
            />

            <TextField
              label="Father name *"
              value={form.fatherName}
              onChange={(e) => set("fatherName", e.target.value)}
              onBlur={() => markTouched("fatherName")}
              error={showError("fatherName")}
              helperText={helper("fatherName")}
            />

            <TextField
              label="Age *"
              value={form.age}
              onChange={(e) => set("age", e.target.value.replace(/[^\d]/g, ""))}
              onBlur={() => markTouched("age")}
              error={showError("age")}
              helperText={helper("age", "Must be 18+")}
              inputMode="numeric"
            />

            {/* Contact */}
            <TextField
              label="Email *"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => markTouched("email")}
              error={showError("email")}
              helperText={helper("email")}
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Phone number *"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => markTouched("phone")}
              error={showError("phone")}
              helperText={helper("phone")}
              autoComplete="tel"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Country *"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              onBlur={() => markTouched("country")}
              error={showError("country")}
              helperText={helper("country")}
            >
              {COUNTRIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="City *"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              onBlur={() => markTouched("city")}
              error={showError("city")}
              helperText={helper("city")}
            />

            {/* Address */}
            <TextField
              label="Address line 1 *"
              value={form.addressLine1}
              onChange={(e) => set("addressLine1", e.target.value)}
              onBlur={() => markTouched("addressLine1")}
              error={showError("addressLine1")}
              helperText={helper("addressLine1")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
            />

            <TextField
              label="Address line 2 (optional)"
              value={form.addressLine2}
              onChange={(e) => set("addressLine2", e.target.value)}
              onBlur={() => markTouched("addressLine2")}
              sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
            />

            <TextField
              label="State / Province (optional)"
              value={form.stateProvince}
              onChange={(e) => set("stateProvince", e.target.value)}
              onBlur={() => markTouched("stateProvince")}
            />

            <TextField
              label="Postal code (optional)"
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              onBlur={() => markTouched("postalCode")}
            />

            {/* Security */}
            <TextField
              label="Password *"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              onBlur={() => markTouched("password")}
              error={showError("password")}
              helperText={helper("password", "Min 8 characters")}
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm password *"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              onBlur={() => markTouched("confirmPassword")}
              error={showError("confirmPassword")}
              helperText={helper("confirmPassword")}
              autoComplete="new-password"
            />
          </Box>

          {/* Terms + submit */}
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.acceptTerms}
                  onChange={(e) => set("acceptTerms", e.target.checked)}
                  onBlur={() => markTouched("acceptTerms")}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  I agree to the Terms and Privacy Policy <b>*</b>
                </Typography>
              }
            />
            {showError("acceptTerms") && (
              <Typography variant="caption" sx={{ display: "block" }} color="error">
                {errors.acceptTerms}
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={submitAttempted && !canSubmit}
            sx={{ mt: 1.5, width: { xs: "100%", sm: "auto" } }}
          >
            Create account
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" underline="hover">
              Log in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
