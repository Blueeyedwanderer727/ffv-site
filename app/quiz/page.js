import FearExperimentQuiz from "../components/FearExperimentQuiz";

export const metadata = {
  title: "Vault Quiz Lab",
  description: "Run Found Footage Vault personality, survival, disturbance, and subgenre quizzes from one classified lab route.",
};

export default function QuizPage() {
  return (
    <FearExperimentQuiz
      basePath="/quiz"
      eyebrow="Vault Quiz Lab"
      title="Found Footage Quiz Lab"
      intro="Personality quizzes, survival tests, disturbance scoring, subgenre sorting, and the core recommendation flows now all live in one archive route."
      availableModes={["personality", "survival", "disturbance", "subgenre", "simple", "traits"]}
    />
  );
}