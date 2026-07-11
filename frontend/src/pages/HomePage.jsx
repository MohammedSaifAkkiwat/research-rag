import { useRef, useState } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import { Hero } from "../components/Hero/Hero";
import { UploadSection } from "../components/Upload/UploadSection";
import { PaperLibrary } from "../components/PaperLibrary/PaperLibrary";
import { ChatSection } from "../components/Chat/ChatSection";
import { StatsSection } from "../components/Stats/StatsSection";
import { Footer } from "../components/Footer/Footer";
import { usePapers } from "../hooks/usePapers";
import { useChat } from "../hooks/useChat";

export function HomePage() {
  const {
    papers,
    isLoading,
    loadError,
    refetch,
    selectedPaperId,
    toggleSelectedPaper,
    uploadPaper,
  } = usePapers();

  const [topK, setTopK] = useState(5);
  const { messages, sendMessage, retryLastQuestion, isThinking, activeStageIndex, stages } = useChat({
    selectedPaperId,
    topK,
  });

  const uploadSectionRef = useRef(null);
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant" && !m.error);

  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero onUploadClick={scrollToUpload} />
        <div ref={uploadSectionRef}>
          <UploadSection onUpload={uploadPaper} />
        </div>
        <PaperLibrary
          papers={papers}
          isLoading={isLoading}
          loadError={loadError}
          onRetry={refetch}
          selectedPaperId={selectedPaperId}
          onSelectPaper={toggleSelectedPaper}
        />
        <ChatSection
          papers={papers}
          selectedPaperId={selectedPaperId}
          onClearPaperFilter={() => toggleSelectedPaper(selectedPaperId)}
          topK={topK}
          onChangeTopK={setTopK}
          messages={messages}
          isThinking={isThinking}
          stages={stages}
          activeStageIndex={activeStageIndex}
          onSend={sendMessage}
          onRetry={retryLastQuestion}
        />
        <StatsSection papers={papers} lastLatencyMs={lastAssistantMessage?.processingTimeMs} topK={topK} />
      </main>
      <Footer />
    </div>
  );
}
