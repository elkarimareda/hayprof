import i18n from "../../i18n";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = () => {
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng); // Change the language
    localStorage.setItem("i18nextLng", lng); // Persist in localStorage
  };

  return (
    <div className="flex justify-center items-center gap-2">
      <Button variant="ghost" onClick={() => changeLanguage("en")}>
        English
      </Button>
      <Button variant="ghost" onClick={() => changeLanguage("fr")}>
        Français
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
