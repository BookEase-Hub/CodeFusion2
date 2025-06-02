// Prisma Schema (Embedded as a comment for context)
/*
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  userType  String   @default("free") // free or premium
  prompts   Prompt[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Prompt {
  id            String     @id @default(uuid())
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  feature       String     // code-gen, code-explain, debug, optimize
  responseTime  Float      // in seconds
  createdAt     DateTime   @default(now())
  completion    Completion?
}

model Completion {
  id        String   @id @default(uuid())
  promptId  String   @unique
  prompt    Prompt   @relation(fields: [promptId], references: [id])
  createdAt DateTime @default(now())
}
*/

// Environment Variables (Embedded as a comment for context)
/*
DATABASE_URL=postgresql://user:password@localhost:5432/ai_metrics?schema=public
PORT=3001
*/

import express, { Express, Request, Response, Router } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
import { Parser } from "json2csv";

// Types
interface TimeRangeFilter {
  startDate: Date;
  endDate: Date;
}

interface MetricsFilter {
  timeRange: string; // 24h, 7d, 30d, 90d, 1y
  feature?: string; // code-gen, code-explain, debug, optimize, all
  searchQuery?: string;
}

interface OverviewMetrics {
  totalPrompts: number;
  totalCompletions: number;
  avgResponseTime: number;
  activeUsers: number;
}

interface UsageData {
  name: string;
  prompts: number;
  completions: number;
}

interface UserMetrics {
  id: string;
  name: string;
  email: string;
  prompts: number;
  completions: number;
  avgResponseTime: number;
}

interface UserTypeMetrics {
  name: string;
  value: number;
}

interface FeatureMetrics {
  name: string;
  value: number;
}

// Prisma Client
const prisma = new PrismaClient();

// Services
const getTimeRange = (timeRange: string): TimeRangeFilter => {
  const endDate = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "24h":
      startDate = dayjs().subtract(1, "day").toDate();
      break;
    case "7d":
      startDate = dayjs().subtract(7, "days").toDate();
      break;
    case "30d":
      startDate = dayjs().subtract(30, "days").toDate();
      break;
    case "90d":
      startDate = dayjs().subtract(90, "days").toDate();
      break;
    case "1y":
      startDate = dayjs().subtract(1, "year").toDate();
      break;
    default:
      startDate = dayjs().subtract(7, "days").toDate();
  }

  return { startDate, endDate };
};

const getOverviewMetrics = async (filter: MetricsFilter): Promise<OverviewMetrics> => {
  const { startDate, endDate } = getTimeRange(filter.timeRange);
  const whereClause: any = {
    createdAt: { gte: startDate, lte: endDate },
  };
  if (filter.feature && filter.feature !== "all") {
    whereClause.feature = filter.feature;
  }

  const [prompts, completions, avgResponseTime, activeUsers] = await Promise.all([
    prisma.prompt.count({ where: whereClause }),
    prisma.completion.count({
      where: { prompt: whereClause },
    }),
    prisma.prompt
      .aggregate({
        where: whereClause,
        _avg: { responseTime: true },
      })
      .then((res) => res._avg.responseTime || 0),
    prisma.user.count({
      where: { prompts: { some: whereClause } },
    }),
  ]);

  return {
    totalPrompts: prompts,
    totalCompletions: completions,
    avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
    activeUsers,
  };
};

const getDailyUsage = async (filter: MetricsFilter): Promise<UsageData[]> => {
  const { startDate, endDate } = getTimeRange(filter.timeRange);
  const whereClause: any = {
    createdAt: { gte: startDate, lte: endDate },
  };
  if (filter.feature && filter.feature !== "all") {
    whereClause.feature = filter.feature;
  }

  const prompts = await prisma.prompt.groupBy({
    by: ["createdAt"],
    where: whereClause,
    _count: { id: true },
  });

  const completions = await prisma.completion.groupBy({
    by: ["createdAt"],
    where: { prompt: whereClause },
    _count: { id: true },
  });

  const days: UsageData[] = [];
  let currentDate = dayjs(startDate);
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
    const dateStr = currentDate.format("ddd");
    const promptCount = prompts.find((p) =>
      dayjs(p.createdAt).isSame(currentDate, "day")
    )?._count.id || 0;
    const completionCount = completions.find((c) =>
      dayjs(c.createdAt).isSame(currentDate, "day")
    )?._count.id || 0;

    days.push({
      name: dateStr,
      prompts: promptCount,
      completions: completionCount,
    });
    currentDate = currentDate.add(1, "day");
  }

  return days;
};

const getMonthlyUsage = async (filter: MetricsFilter): Promise<UsageData[]> => {
  const { startDate, endDate } = getTimeRange(filter.timeRange);
  const whereClause: any = {
    createdAt: { gte: startDate, lte: endDate },
  };
  if (filter.feature && filter.feature !== "all") {
    whereClause.feature = filter.feature;
  }

  const prompts = await prisma.prompt.groupBy({
    by: ["createdAt"],
    where: whereClause,
    _count: { id: true },
  });

  const completions = await prisma.completion.groupBy({
    by: ["createdAt"],
    where: { prompt: whereClause },
    _count: { id: true },
  });

  const months: UsageData[] = [];
  let currentDate = dayjs(startDate).startOf("month");
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "month")) {
    const monthStr = currentDate.format("MMM");
    const promptCount = prompts
      .filter((p) => dayjs(p.createdAt).isSame(currentDate, "month"))
      .reduce((sum, p) => sum + p._count.id, 0);
    const completionCount = completions
      .filter((c) => dayjs(c.createdAt).isSame(currentDate, "month"))
      .reduce((sum, c) => sum + c._count.id, 0);

    months.push({
      name: monthStr,
      prompts: promptCount,
      completions: completionCount,
    });
    currentDate = currentDate.add(1, "month");
  }

  return months;
};

const getUserMetrics = async (
  filter: MetricsFilter,
  page: number,
  itemsPerPage: number
): Promise<{ data: UserMetrics[]; total: number }> => {
  const { startDate, endDate } = getTimeRange(filter.timeRange);
  const whereClause: any = {
    prompts: { some: { createdAt: { gte: startDate, lte: endDate } } },
  };
  if (filter.feature && filter.feature !== "all") {
    whereClause.prompts.some.feature = filter.feature;
  }
  if (filter.searchQuery) {
    whereClause.OR = [
      { name: { contains: filter.searchQuery, mode: "insensitive" } },
      { email: { contains: filter.searchQuery, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      prompts: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
          ...(filter.feature && filter.feature !== "all" ? { feature: filter.feature } : {}),
        },
        select: {
          id: true,
          responseTime: true,
          completion: true,
        },
      },
    },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
    orderBy: { prompts: { _count: "desc" } },
  });

  const total = await prisma.user.count({ where: whereClause });

  const data: UserMetrics[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    prompts: user.prompts.length,
    completions: user.prompts.filter((p) => p.completion).length,
    avgResponseTime: parseFloat(
      (
        user.prompts.reduce((sum, p) => sum + p.responseTime, 0) / user.prompts.length || 0
      ).toFixed(2)
    ),
  }));

  return { data, total };
};

const getUserTypeMetrics = async (filter: MetricsFilter): Promise<UserTypeMetrics[]> => {
  const { startDate, endDate } = getTimeRange(filter.timeRange);
  const whereClause: any = {
    createdAt: { gte: startDate, lte: endDate },
  };
  if (filter.feature && filter.feature !== "all") {
    whereClause.feature = filter.feature;
  }

  const users = await prisma.user.groupBy({
    by: ["userType"],
    where: { prompts: { some: whereClause } },
    _count: { id: true },
  });

  const total = users.reduce((sum, u) => sum + u._count.id, 0);
  return users.map((u) => ({
    name: u.userType === "free" ? "Free Users" : "Premium Users",
    value: parseFloat(((u._count.id / total) * 100).toFixed(2)),
  }));
};

const getFeatureMetrics = async (filter: MetricsFilter): Promise<FeatureMetrics[]> => {
  const { startDate, endDate } = getTimeRange(filter.timeRange);
  const whereClause: any = {
    createdAt: { gte: startDate, lte: endDate },
  };

  const prompts = await prisma.prompt.groupBy({
    by: ["feature"],
    where: whereClause,
    _count: { id: true },
  });

  const total = prompts.reduce((sum, p) => sum + p._count.id, 0);
  return prompts.map((p) => ({
    name:
      p.feature === "code-gen"
        ? "Code Generation"
        : p.feature === "code-explain"
        ? "Code Explanation"
        : p.feature === "debug"
        ? "Debugging"
        : "Optimization",
    value: parseFloat(((p._count.id / total) * 100).toFixed(2)),
  }));
};

// CSV Export Utility
const exportUsersToCSV = (users: UserMetrics[]): string => {
  const fields = ["id", "name", "email", "prompts", "completions", "avgResponseTime"];
  const parser = new Parser({ fields });
  return parser.parse(users);
};

// Validation Schema
const MetricsFilterSchema = z.object({
  timeRange: z.enum(["24h", "7d", "30d", "90d", "1y"]).default("7d"),
  feature: z.enum(["all", "code-gen", "code-explain", "debug", "optimize"]).optional(),
  searchQuery: z.string().optional(),
});

// Controllers
const getOverview = async (req: Request, res: Response) => {
  try {
    const filter = MetricsFilterSchema.parse(req.query);
    const metrics = await getOverviewMetrics(filter);
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : "Internal server error" });
  }
};

const getDaily = async (req: Request, res: Response) => {
  try {
    const filter = MetricsFilterSchema.parse(req.query);
    const data = await getDailyUsage(filter);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : "Internal server error" });
  }
};

const getMonthly = async (req: Request, res: Response) => {
  try {
    const filter = MetricsFilterSchema.parse(req.query);
    const data = await getMonthlyUsage(filter);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : "Internal server error" });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const filter = MetricsFilterSchema.parse(req.query);
    const page = parseInt(req.query.page as string) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage as string) || 5;
    const data = await getUserMetrics(filter, page, itemsPerPage);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : "Internal server error" });
  }
};

const getUserTypes = async (req: Request, res: Response) => {
  try {
    const filter = MetricsFilterSchema.parse(req.query);
    const data = await getUserTypeMetrics(filter);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : "Internal server error" });
  }
};

const getFeatures = async (req: Request, res: Response) => {
  try {
    const filter = MetricsFilterSchema.parse(req.query);
    const data = await getFeatureMetrics(filter);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : "Internal server error" });
  }
};

const exportUsers = async (req: Request, res: Response) => {
  try {
    const filter = MetricsFilterSchema.parse(req.query);
    const { data } = await getUserMetrics(filter, 1, 1000); // Fetch all users for export
    const csv = exportUsersToCSV(data);
    res.header("Content-Type", "text/csv");
    res.attachment("user_metrics.csv");
    res.send(csv);
  } catch (error) {
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : "Internal server error" });
  }
};

// Routes
const router = Router();
router.get("/overview", getOverview);
router.get("/daily", getDaily);
router.get("/monthly", getMonthly);
router.get("/users", getUsers);
router.get("/user-types", getUserTypes);
router.get("/features", getFeatures);
router.get("/export-users", exportUsers);

// Express Server
const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api/metrics", router);

app.listen(port, () => {
  console.log(Server running on port ${port});
});

// Seed Function (Optional, for initial data population)
/*
async function seed() {
  await prisma.user.createMany({
    data: [
      { id: "1", name: "John Doe", email: "john@example.com", userType: "premium" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", userType: "free" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", userType: "free" },
      { id: "4", name: "Alice Williams", email: "alice@example.com", userType: "premium" },
      { id: "5", name: "Charlie Brown", email: "charlie@example.com", userType: "free" },
    ],
    skipDuplicates: true,
  });

  await prisma.prompt.createMany({
    data: [
      { id: "p1", userId: "1", feature: "code-gen", responseTime: 1.2, createdAt: new Date() },
      { id: "p2", userId: "1", feature: "code-explain", responseTime: 1.3, createdAt: new Date() },
      { id: "p3", userId: "2", feature: "debug", responseTime: 1.5, createdAt: new Date() },
      // Add more sample prompts
    ],
    skipDuplicates: true,
  });

  await prisma.completion.createMany({
    data: [
      { id: "c1", promptId: "p1", createdAt: new Date() },
      { id: "c2", promptId: "p2", createdAt: new Date() },
      // Add more sample completions
    ],
    skipDuplicates: true,
  });

  console.log("Database seeded!");
}

// Uncomment to run seed
// seed().catch((e) => console.error(e)).finally(async () => await prisma.$disconnect());
*/
