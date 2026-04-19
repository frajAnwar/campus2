import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Clock,
  Globe,
  Users,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

type Params = Promise<{ clubId: string; eventId: string }>;

export default async function EventDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { clubId, eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: {
        select: { id: true, name: true, logo: true },
      },
      registrations: {
        where: { userId: session.user.id },
        select: { id: true, checkedInAt: true, formData: true },
      },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();

  const isRegistered = event.registrations.length > 0;
  const isCheckedIn = isRegistered && !!event.registrations[0].checkedInAt;
  const isFull = event.capacity
    ? event._count.registrations >= event.capacity
    : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/clubs/${clubId}`} className="hover:underline">
          {event.club.name}
        </Link>
        <span>/</span>
        <span>Events</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">{event.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {event.date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {event.date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <Badge variant="outline">{event.type}</Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {event.location && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
        )}
        {event.onlineUrl && (
          <a
            href={event.onlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <Globe className="h-4 w-4" />
            Join Online
          </a>
        )}
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          {event._count.registrations}
          {event.capacity ? ` / ${event.capacity}` : ""} registered
        </span>
      </div>

      {event.description && (
        <Card>
          <CardContent className="pt-4">
            <p className="whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {event.bannerImage && (
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full rounded-lg object-cover max-h-64"
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent>
          {isCheckedIn ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium">You&apos;re checked in!</p>
                <p className="text-sm text-muted-foreground">
                  Checked in at{" "}
                  {new Date(event.registrations[0].checkedInAt!).toLocaleString()}
                </p>
              </div>
              {event.qrCode && (
                <div className="flex justify-center pt-2">
                  <div className="border rounded-lg p-4 bg-white">
                    <QrCode className="h-32 w-32 text-black" />
                    <p className="text-xs text-center mt-2 text-black">
                      {event.qrCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : isRegistered ? (
            <div className="text-center space-y-2 py-4">
              <p className="font-medium">You&apos;re registered!</p>
              <p className="text-sm text-muted-foreground">
                Present this QR code at the event to check in.
              </p>
              {event.qrCode && (
                <div className="flex justify-center pt-2">
                  <div className="border rounded-lg p-4 bg-white">
                    <QrCode className="h-32 w-32 text-black" />
                    <p className="text-xs text-center mt-2 text-black">
                      {event.qrCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : isFull ? (
            <p className="text-center py-4 text-destructive">
              This event is at full capacity.
            </p>
          ) : (
            <form
              action={`/api/clubs/${clubId}/events/${eventId}/register`}
              method="POST"
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Register to attend this event.
              </p>
              <Button type="submit">Register</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
