import { google } from 'googleapis';
import { prisma } from './prisma';

export async function getGoogleClassroomClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  });

  if (!account?.access_token) {
    return null;
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  return google.classroom({ version: 'v1', auth });
}

export async function syncClassesWithGoogleClassroom(userId: string) {
  const classroom = await getGoogleClassroomClient(userId);
  if (!classroom) return { success: false, error: 'Google Classroom not connected' };

  try {
    const res = await classroom.courses.list({
      courseStates: ['ACTIVE'],
    });

    const courses = res.data.courses || [];
    
    // Sync courses to local database
    for (const course of courses) {
      await prisma.class.upsert({
        where: { id: course.id! },
        update: {
          name: course.name!,
          description: course.descriptionHeading,
        },
        create: {
          id: course.id!,
          name: course.name!,
          description: course.descriptionHeading,
          educatorId: userId,
          universityId: 'temp', // This will be updated with actual university
          enrollmentCode: course.enrollmentCode || '',
        },
      });
    }

    return { success: true, courses: courses.length };
  } catch (error) {
    return { success: false, error: 'Failed to sync with Google Classroom' };
  }
}

export async function getClassroomAssignments(courseId: string, userId: string) {
  const classroom = await getGoogleClassroomClient(userId);
  if (!classroom) return { success: false, error: 'Google Classroom not connected' };

  try {
    const res = await classroom.courses.courseWork.list({
      courseId,
    });

    return { success: true, assignments: res.data.courseWork || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch assignments' };
  }
}

export async function getStudentSubmissions(courseId: string, courseWorkId: string, userId: string) {
  const classroom = await getGoogleClassroomClient(userId);
  if (!classroom) return { success: false, error: 'Google Classroom not connected' };

  try {
    const res = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId,
    });

    return { success: true, submissions: res.data.studentSubmissions || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch submissions' };
  }
}
