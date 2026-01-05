import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Sign Up - JobFinder",
  description: "Create a new account.",
};

export default function RegisterPage() {
  // We tell the component to start on the "signup" view
  return <AuthForm initialView="signup" />;
}