import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { ConquestRoadmap } from "@/components/learn/ConquestRoadmap";
import { StatsSidebar } from "@/components/learn/StatsSidebar";
import { UserNav } from "@/components/user/UserNav";

async function getUserStats(supabase: any, userId: string) {
  const { data: progress } = await supabase
    .from("vocabulary_progress")
    .select("hsk_level, mastery_level")
    .eq("user_id", userId);

  const stats = Array.from({ length: 6 }, (_, i) => {
    const level = i + 1;
    const levelProgress = progress?.filter((p: any) => p.hsk_level === level) || [];
    return {
      level,
      total: 100 * level,
      mastered: levelProgress.filter((p: any) => p.mastery_level >= 4).length,
      learning: levelProgress.filter((p: any) => p.mastery_level > 0 && p.mastery_level < 4).length,
      new: 100 * level - levelProgress.length,
    };
  });

  return stats;
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Get stats
  let stats = await getUserStats(supabase, user.id);
  
  // Fallback stats if empty
  if (!stats.length) {
    stats = Array.from({ length: 6 }, (_, i) => ({
      level: i + 1,
      total: 100 * (i + 1),
      mastered: 0,
      learning: 0,
      new: 100 * (i + 1),
    }));
  }

  const userValues = {
    name: user.user_metadata?.full_name || user.email?.split("@")[0],
    currentLevel: "3",
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] font-display">
      <UserNav user={user} role={profile?.role || "user"} />
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
          {/* Left Column: Navigation Sidebar (2 cols) */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <DashboardSidebar />
          </div>

          {/* Center Column: Main Content (7 cols) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
            <WelcomeHero userValues={userValues} />

            {/* Conquest Roadmap in 'full' mode acting as the Mountain Path */}
            <div className="bg-white rounded-3xl p-6 border border-[#f0ebe0]">
              <ConquestRoadmap stats={stats} mode="full" />
            </div>
          </div>

          {/* Right Column: Widgets (3 cols) */}
          <div className="hidden xl:block xl:col-span-3">
            <StatsSidebar stats={stats} />
          </div>
        </div>
      </main>
    </div>
  );
}
