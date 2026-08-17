import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock, routerMock } from "@/test/mocks";
import { AuthForm } from "./auth-form";

const supabase = createSupabaseMock();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => supabase.client,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

describe("AuthForm", () => {
  beforeEach(() => {
    supabase.client.auth.signUp.mockClear();
    supabase.client.auth.signInWithPassword.mockClear();
    supabase.client.auth.signUp.mockResolvedValue({
      data: { user: { identities: [{}] }, session: { access_token: "t" } },
      error: null,
    });
    supabase.client.auth.signInWithPassword.mockResolvedValue({ error: null });
  });

  async function fill(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByPlaceholderText("Email"), "a@b.com");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
  }

  it("signs up with an email confirmation redirect", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(supabase.client.auth.signUp).toHaveBeenCalledTimes(1);
    });
    const args = supabase.client.auth.signUp.mock.calls[0][0];
    expect(args.email).toBe("a@b.com");
    expect(args.password).toBe("secret123");
    expect(args.options.emailRedirectTo).toMatch(/\/auth\/callback$/);
  });

  it("tells the athlete to confirm their email when no session comes back", async () => {
    supabase.client.auth.signUp.mockResolvedValue({
      data: { user: { identities: [{}] }, session: null },
      error: null,
    });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
    expect(screen.getByText("a@b.com")).toBeInTheDocument();
  });

  it("points duplicate signups to the login page", async () => {
    supabase.client.auth.signUp.mockResolvedValue({
      data: { user: { identities: [] }, session: null },
      error: null,
    });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/already exists\. log in instead/i),
    ).toBeInTheDocument();
  });

  it("logs in with password", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" nextPath="/dashboard" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(supabase.client.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "secret123",
      });
    });
  });

  it("humanizes login errors and re-enables the button", async () => {
    supabase.client.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText("Wrong email or password."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled();
  });

  it("explains unconfirmed-email login failures", async () => {
    supabase.client.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Email not confirmed" },
    });
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText(/isn't confirmed yet/i),
    ).toBeInTheDocument();
  });
});
