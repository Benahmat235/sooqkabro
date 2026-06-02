import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthBlobs from "@/components/auth/AuthBlobs";
import helloImg from "@/assets/onboarding-hello.jpg";
import readyImg from "@/assets/onboarding-ready.jpg";

type Slide = {
  image: string;
  title: string;
  body: string;
};

const slides: Slide[] = [
  {
    image: helloImg,
    title: "Hello",
    body: "Bienvenue sur Sooq Kabro, la place de marché du Tchad. Achetez et vendez en toute confiance, partout dans le pays.",
  },
  {
    image: readyImg,
    title: "Prêt ?",
    body: "Découvrez des milliers d'annonces près de chez vous, contactez les vendeurs en un clic et publiez gratuitement.",
  },
];

const ONBOARDED_KEY = "sk_onboarded";

const OnboardingPage = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(ONBOARDED_KEY) === "1") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const finish = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      /* ignore */
    }
    navigate("/auth");
  };

  const next = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const skip = () => finish();

  const slide = slides[index];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <AuthBlobs variant="minimal" />

      <button
        onClick={skip}
        className="absolute top-4 right-4 z-10 text-sm font-semibold text-foreground/70 hover:text-foreground"
      >
        Passer
      </button>

      <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-8 max-w-md mx-auto w-full">
        {/* Image card */}
        <div className="w-full rounded-3xl overflow-hidden shadow-warm bg-card animate-fade-in" key={index}>
          <img
            src={slide.image}
            alt={slide.title}
            width={1024}
            height={1280}
            loading="eager"
            className="w-full h-auto object-cover aspect-[4/5]"
          />
        </div>

        {/* Text */}
        <div className="text-center mt-8 space-y-3 animate-fade-in-up" key={`text-${index}`}>
          <h1 className="text-4xl font-extrabold text-foreground">{slide.title}</h1>
          <p className="text-base text-muted-foreground leading-relaxed px-2">{slide.body}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-primary" : "w-2.5 bg-accent"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={next}
          className="mt-auto w-full h-14 rounded-full text-base font-bold shadow-warm"
        >
          {index === slides.length - 1 ? "Commencer" : "Suivant"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
