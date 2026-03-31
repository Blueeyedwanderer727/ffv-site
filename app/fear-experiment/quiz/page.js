import FearExperimentQuiz from "../../components/FearExperimentQuiz";
import { fearExperimentLockedModes, fearExperimentQuizModes } from "../../data/fearExperiment";

export const metadata = {
  title: "Fear Experiment Quiz Lab",
  description: "Run the live Fear Experiment quiz tracks, unlock bonus labs, and turn your answers into found footage recommendations.",
};

export default function FearExperimentQuizPage() {
  return (
    <FearExperimentQuiz
      basePath="/fear-experiment/quiz"
      eyebrow="Fear Experiment"
      title="Enter The Fear Experiment"
      intro="Four quiz tracks are live now, with two bonus labs staged as coming soon while the next unlock layer is prepared."
      availableModes={fearExperimentQuizModes}
      lockedModes={fearExperimentLockedModes}
    />
  );
}