import { PrismaClient, Role, Rank, PostType, AssignmentStatus, SubmissionStatus, ProjectStatus, ClubCategory, EventType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create a University
  const university = await prisma.university.upsert({
    where: { slug: "stanford" },
    update: {},
    create: {
      name: "Stanford University",
      slug: "stanford",
      description: "A world-renowned research university in Stanford, California.",
      country: "USA",
      city: "Stanford",
      domain: "stanford.edu",
    },
  });

  // 2. Create Passwords
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@campus.com" },
    update: {},
    create: {
      name: "Platform Admin",
      username: "admin",
      email: "admin@campus.com",
      password: hashedPassword,
      role: Role.PLATFORM_ADMIN,
      universityId: university.id,
      xp: 10000,
      rank: Rank.LEGEND,
    },
  });

  const educator = await prisma.user.upsert({
    where: { email: "prof.smith@campus.com" },
    update: {},
    create: {
      name: "Professor Smith",
      username: "drsmith",
      email: "prof.smith@campus.com",
      password: hashedPassword,
      role: Role.EDUCATOR,
      universityId: university.id,
      tagline: "Computer Science Dept Head",
      bio: "Passionate about teaching algorithms and data structures.",
      xp: 5000,
      rank: Rank.MENTOR,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "john.doe@campus.com" },
    update: {},
    create: {
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@campus.com",
      password: hashedPassword,
      role: Role.STUDENT,
      universityId: university.id,
      xp: 1200,
      rank: Rank.FRESHMAN,
      currentStreak: 5,
    },
  });

  // 4. Create a Class
  const cs101 = await prisma.class.upsert({
    where: { enrollmentCode: "CS101-FALL24" },
    update: {},
    create: {
      name: "Intro to Computer Science",
      description: "Foundational concepts of programming and logic.",
      educatorId: educator.id,
      universityId: university.id,
      term: "Fall 2024",
      subjectTag: "CS",
      enrollmentCode: "CS101-FALL24",
    },
  });

  // 5. Enroll student in class
  await prisma.classMember.upsert({
    where: { classId_userId: { classId: cs101.id, userId: student.id } },
    update: {},
    create: {
      classId: cs101.id,
      userId: student.id,
      role: "STUDENT",
    },
  });

  // 6. Create Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      classId: cs101.id,
      title: "First Program in Python",
      description: "Write a program that prints 'Hello Campus' and takes user input.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: AssignmentStatus.PUBLISHED,
      maxPoints: 100,
    },
  });

  // 7. Create some Forum Posts
  await prisma.post.createMany({
    data: [
      {
        authorId: student.id,
        title: "How to get started with Next.js 16?",
        body: "I'm looking for a clear guide on the new app router features in Next.js 16. Any recommendations?",
        type: PostType.QUESTION,
        visibility: "PUBLIC",
        tags: ["NextJS", "WebDev", "Frontend"],
      },
      {
        authorId: educator.id,
        title: "Resources for Algorithms Exam",
        body: "Hey class, I've posted some new notes in the resources tab. Make sure to check them before Friday!",
        type: PostType.DISCUSSION,
        classId: cs101.id,
        visibility: "CLASS",
        tags: ["Exam", "Algorithms", "StudyTips"],
      },
    ],
  });

  // 8. Create a Project
  await prisma.project.create({
    data: {
      ownerId: student.id,
      title: "Campus Platform Redesign",
      description: "A premium redesign of the campus platform with glassmorphism and modern UX.",
      techTags: ["Next.js", "Prisma", "Tailwind", "Framer Motion"],
      status: ProjectStatus.IN_PROGRESS,
      visibility: "PUBLIC",
    },
  });

  // 9. Create a Club and an Event
  const techClub = await prisma.club.upsert({
    where: { slug: "tech-innovators" },
    update: {},
    create: {
      name: "Tech Innovators",
      slug: "tech-innovators",
      description: "A hub for students to build and launch side projects.",
      category: ClubCategory.TECH,
      universityId: university.id,
      managerId: student.id,
    },
  });

  await prisma.event.create({
    data: {
      clubId: techClub.id,
      title: "Weekly Hack Night",
      description: "Join us for a night of coding, pizza, and networking.",
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: "Innovation Hub, Room 402",
      capacity: 50,
    },
  });

  console.log("✅ Seed complete!");
  console.log("--------------------------------");
  console.log("Demo Accounts:");
  console.log(`Admin: admin@campus.com / password123`);
  console.log(`Educator: prof.smith@campus.com / password123`);
  console.log(`Student: john.doe@campus.com / password123`);
  console.log("--------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
