import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Login - JobFinder",
  description: "Login to your account.",
};

export default function LoginPage() {
  // We tell the component to start on the "login" view
  return <AuthForm initialView="login" />;
}