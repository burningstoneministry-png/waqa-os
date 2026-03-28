"""
XP Gamification Service for Waqa-OS
Calculates daily/weekly/monthly XP from logged habits
Manages skill tree progression, rewards, and milestones
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Tuple

# ─── XP REWARD MAPPING ───────────────────────────────────────────────────────
# Base XP values for daily habits (from waqa_os_34yr_roadmap.md)

XP_REWARDS = {
    "prayer_20min": 10,
    "bible_study_30min": 10,
    "water_2_5l": 5,
    "training_60min": 15,
    "research_120min": 20,
    "coding_120min": 20,
    "bass_practice_60min": 10,
    "fasting_weekly": 25,
    "mentoring_teaching": 30,
}

BONUS_XP = {
    "7day_consistency": 50,  # awarded when 7 consecutive days all habits hit
    "all_habits_month": 100,  # awarded once per month when all daily habits hit
}

SKILL_TREES = {
    "prayer_spirit": {"name": "Prayer & Spirit", "color": "#f59e0b", "icon": "🙏"},
    "antigravity": {"name": "Antigravity Research", "color": "#0891b2", "icon": "🔬"},
    "kingdom_influence": {"name": "Kingdom Influence", "color": "#dc2626", "icon": "👑"},
    "coding_automation": {"name": "Coding & Automation", "color": "#16a34a", "icon": "💻"},
    "health_discipline": {"name": "Health & Discipline", "color": "#ea580c", "icon": "💪"},
    "spiritual_engineering": {"name": "Spiritual Engineering", "color": "#9333ea", "icon": "⚙️"},
}

# XP per skill level (cumulative)
XP_PER_LEVEL = {
    1: 500,     # Level 1-2
    2: 1000,    # Level 2-3
    3: 1500,    # Level 3-4
    4: 2000,    # Level 4-5
    5: 2500,    # Level 5-6
    6: 3000,    # Level 6-7
    7: 3500,    # Level 7-8
    8: 4000,    # Level 8-9
    9: 4500,    # Level 9-10
    10: 5000,   # Level 10 (max)
}

# ─── HABIT TO SKILL TREE MAPPING ────────────────────────────────────────────
HABIT_SKILL_MAPPING = {
    "prayer": "prayer_spirit",
    "bible_study": "prayer_spirit",
    "research": "antigravity",
    "mission": "kingdom_influence",
    "coding": "coding_automation",
    "training": "health_discipline",
    "water": "health_discipline",
    "bass": "health_discipline",
    "fasting": "health_discipline",
    "spiritual_engineering": "spiritual_engineering",
}

# ─── PHASE REQUIREMENTS ─────────────────────────────────────────────────────
PHASE_UNLOCK_REQUIREMENTS = {
    1: {"min_xp": 0, "min_level_6_trees": 0},           # Starting phase
    2: {"min_xp": 250000, "min_level_6_trees": 3},      # All phases need 250k XP
    3: {"min_xp": 500000, "min_level_6_trees": 3},
    4: {"min_xp": 750000, "min_level_6_trees": 4},
    5: {"min_xp": 1000000, "min_level_6_trees": 4},
    6: {"min_xp": 1250000, "min_level_6_trees": 5},
    7: {"min_xp": 1500000, "min_level_6_trees": 5},
}


class XPCalculator:
    """Main XP calculation engine"""

    def __init__(self, sb=None):
        """Initialize with Supabase client (optional)"""
        self.sb = sb

    def calculate_daily_xp(self, logged_data: Dict) -> int:
        """
        Calculate total XP for a given day based on logged activities

        Args:
            logged_data: Dict with activity durations/completions
            Example: {
                "prayer_minutes": 20,
                "bible_study_minutes": 30,
                "water_ml": 2500,
                "training_minutes": 60,
                ...
            }
        """
        total_xp = 0
        breakdown = {}

        # Prayer
        if logged_data.get("prayer_minutes", 0) >= 20:
            total_xp += XP_REWARDS["prayer_20min"]
            breakdown["prayer"] = XP_REWARDS["prayer_20min"]

        # Bible Study
        if logged_data.get("bible_study_minutes", 0) >= 30:
            total_xp += XP_REWARDS["bible_study_30min"]
            breakdown["bible_study"] = XP_REWARDS["bible_study_30min"]

        # Water (2.5L = 2500ml)
        if logged_data.get("water_ml", 0) >= 2500:
            total_xp += XP_REWARDS["water_2_5l"]
            breakdown["water"] = XP_REWARDS["water_2_5l"]

        # Training
        if logged_data.get("training_minutes", 0) >= 60:
            total_xp += XP_REWARDS["training_60min"]
            breakdown["training"] = XP_REWARDS["training_60min"]

        # Research
        if logged_data.get("research_minutes", 0) >= 120:
            total_xp += XP_REWARDS["research_120min"]
            breakdown["research"] = XP_REWARDS["research_120min"]

        # Coding
        if logged_data.get("coding_minutes", 0) >= 120:
            total_xp += XP_REWARDS["coding_120min"]
            breakdown["coding"] = XP_REWARDS["coding_120min"]

        # Bass Practice
        if logged_data.get("bass_practice_minutes", 0) >= 60:
            total_xp += XP_REWARDS["bass_practice_60min"]
            breakdown["bass"] = XP_REWARDS["bass_practice_60min"]

        # Fasting (weekly)
        if logged_data.get("fasting_weekly", False):
            total_xp += XP_REWARDS["fasting_weekly"]
            breakdown["fasting"] = XP_REWARDS["fasting_weekly"]

        # Mentoring
        if logged_data.get("mentoring_minutes", 0) > 0:
            total_xp += XP_REWARDS["mentoring_teaching"]
            breakdown["mentoring"] = XP_REWARDS["mentoring_teaching"]

        return total_xp, breakdown

    def calculate_consistency_bonus(self, consistency_days: int) -> int:
        """
        Calculate streak bonus
        7 consecutive days of all habits = 50 XP bonus
        """
        if consistency_days >= 7:
            return BONUS_XP["7day_consistency"]
        return 0

    def get_skill_xp_category(self, habit: str) -> str:
        """Map habit to skill tree for XP distribution"""
        return HABIT_SKILL_MAPPING.get(habit, "coding_automation")

    def calculate_monthly_metrics(self, month_start: date, month_end: date) -> Dict:
        """
        Calculate monthly XP totals and metrics
        Returns aggregated data for dashboard
        """
        if not self.sb:
            # Mock data for development
            return {
                "total_xp": 1850,
                "total_days": 25,
                "avg_daily_xp": 74,
                "consistency_percentage": 87,
                "best_day": 120,
                "worst_day": 35,
                "bonuses_earned": 150,
                "streak": 12,
            }

        # Query xp_logs table
        try:
            response = self.sb.table("xp_logs").select(
                "date, daily_total, consistency_bonus, all_habits_bonus"
            ).gte("date", month_start.isoformat()).lte("date", month_end.isoformat()).execute()

            logs = response.data
            if not logs:
                return {"total_xp": 0, "error": "No data for this month"}

            total_xp = sum(log["daily_total"] for log in logs)
            daily_xps = [log["daily_total"] for log in logs if log["daily_total"] > 0]

            return {
                "total_xp": total_xp,
                "total_days": len(logs),
                "avg_daily_xp": int(total_xp / len(logs)) if logs else 0,
                "best_day": max(daily_xps) if daily_xps else 0,
                "worst_day": min(daily_xps) if daily_xps else 0,
                "days_active": len(daily_xps),
            }
        except Exception as e:
            return {"error": str(e)}

    def get_skill_level(self, skill_tree: str, total_xp: int) -> Tuple[int, int]:
        """
        Calculate skill level from total XP
        Returns: (current_level, xp_to_next_level)
        """
        level = 1
        cumulative_xp = 0

        for lvl in range(1, 11):
            required_xp = XP_PER_LEVEL[lvl]
            if cumulative_xp + required_xp <= total_xp:
                cumulative_xp += required_xp
                level = lvl + 1  # Next level
            else:
                break

        # Cap at level 10
        if level > 10:
            level = 10

        # XP needed to reach next level
        next_level_req = XP_PER_LEVEL.get(level, 5000)
        xp_to_next = cumulative_xp + next_level_req - total_xp

        return level, xp_to_next

    def check_phase_unlock(self, total_xp: int, skill_levels: Dict[str, int]) -> Tuple[int, bool]:
        """
        Determine which phase is unlocked based on XP and skill levels
        Returns: (max_unlocked_phase, all_requirements_met)
        """
        max_phase = 1

        for phase_num in range(2, 8):  # Check phases 2-7
            requirements = PHASE_UNLOCK_REQUIREMENTS[phase_num]
            min_xp = requirements["min_xp"]
            min_trees = requirements["min_level_6_trees"]

            if total_xp >= min_xp:
                trees_at_level_6 = sum(1 for lvl in skill_levels.values() if lvl >= 6)
                if trees_at_level_6 >= min_trees:
                    max_phase = phase_num

        return max_phase, max_phase > 1


# ─── REWARD TIER LOGIC ──────────────────────────────────────────────────────

class RewardTracker:
    """Manages reward tracking and eligibility"""

    def __init__(self, sb=None):
        self.sb = sb

    def check_tier1_eligible(self, consistency_percentage: int) -> bool:
        """
        Tier 1 (Weekly): 6/7 days consistency = 71%+
        """
        return consistency_percentage >= 71

    def check_tier2_eligible(self, month_consistency: int, skill_levelups: int) -> bool:
        """
        Tier 2 (Monthly): 90%+ month consistency + 2+ skill level-ups
        """
        return month_consistency >= 90 and skill_levelups >= 2

    def check_tier3_eligible(self, phase_milestones_complete: int, total_phase_milestones: int) -> bool:
        """
        Tier 3 (Phase): 80% of phase milestones complete
        """
        percentage = (phase_milestones_complete / total_phase_milestones * 100) if total_phase_milestones > 0 else 0
        return percentage >= 80

    def check_tier4_eligible(self, skill_tree: str, skill_level: int) -> bool:
        """
        Tier 4 (Mastery): Reach Level 10 in any skill tree
        """
        return skill_level >= 10

    def get_reward_status(self, tracker_data: Dict) -> Dict:
        """
        Get current reward eligibility status for all tiers
        """
        return {
            "tier1": {
                "eligible": self.check_tier1_eligible(tracker_data.get("weekly_consistency", 0)),
                "name": "Weekly Wins",
                "reward": "McDonald's / Nice restaurant with kids",
                "budget": "$30 FJD",
                "progress": f"{tracker_data.get('weekly_consistency', 0)}%",
            },
            "tier2": {
                "eligible": self.check_tier2_eligible(
                    tracker_data.get("monthly_consistency", 0),
                    tracker_data.get("skill_levelups_this_month", 0)
                ),
                "name": "Monthly Excellence",
                "reward": "Upscale restaurant dinner with family",
                "budget": "$120 FJD",
                "progress": f"{tracker_data.get('monthly_consistency', 0)}%",
            },
            "tier3": {
                "eligible": self.check_tier3_eligible(
                    tracker_data.get("phase_milestones_done", 0),
                    tracker_data.get("phase_total_milestones", 25)
                ),
                "name": "Phase Milestone",
                "reward": "Beach day / picnic with family",
                "budget": "$400 FJD",
                "progress": f"{tracker_data.get('phase_progress_percent', 0)}%",
            },
            "tier4": {
                "eligible": self.check_tier4_eligible(
                    "prayer_spirit",  # Example
                    tracker_data.get("highest_skill_level", 0)
                ),
                "name": "Skill Mastery",
                "reward": "Family vacation (1-2 weeks)",
                "budget": "$3000+ FJD",
                "progress": f"{tracker_data.get('highest_skill_level', 0)}/10",
            },
        }
