import { ToastProvider } from "./hooks/useToast";
import { ToastContainer } from "./components/Toast/ToastContainer";
import { AnimatedBackground } from "./components/AnimatedBackground/AnimatedBackground";
import { HomePage } from "./pages/HomePage";

export default function App() {
  return (
    <ToastProvider>
      <AnimatedBackground />
      <HomePage />
      <ToastContainer />
    </ToastProvider>
  );
}
