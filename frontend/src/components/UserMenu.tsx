import { Button } from "@/components/ui/button";
import Avatar from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, LogOut, User } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

function UserMenu() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return isAuthenticated && user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Avatar
            image={user.profile?.photo_url}
            alt={user.name}
            fallback={getInitials(user.name)}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-card border-border shadow-lg"
        align="end"
        forceMount
      >
        {user?.user_type !== "admin" && (
          <>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-card-foreground">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {user?.user_type}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={() => router.navigate({ to: "/profile" })}
              className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>{t("profile")}</span>
            </DropdownMenuItem>

            {user?.user_type === "teacher" && (
              <DropdownMenuItem
                onClick={() => router.navigate({ to: "/course" })}
                className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{t("new_course")}</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-border" />
          </>
        )}

        <DropdownMenuItem
          onClick={() => logout()}
          className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Link to="/login" className="text-sm text-muted-foreground">
      {t("login")}
    </Link>
  );
}

export default UserMenu;
