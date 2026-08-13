import { redirect } from "next/navigation";
import { DateTime } from "luxon";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { idiomaLabels } from "@/lib/labels";
import { InviteTeacherForm } from "@/components/invite-teacher-form";
import { PromoteStudentButton } from "@/components/promote-student-button";
import { DeleteUserButton } from "@/components/delete-user-button";
import { EditTeacherButton } from "@/components/edit-teacher-button";

function formatUsd(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMIN") redirect("/login");

  const monthStart = DateTime.now().startOf("month").toJSDate();
  const now = new Date();

  const [students, teachers, payments] = await Promise.all([
    prisma.user.findMany({
      where: { rol: "ALUMNO" },
      include: { hourPackages: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.teacher.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({ where: { estado: "COMPLETADO" } }),
  ]);

  const totalRevenueUsd = payments.reduce(
    (total, p) => total + Number(p.montoUsd),
    0,
  );
  const revenueThisMonthUsd = payments
    .filter((p) => p.fecha >= monthStart)
    .reduce((total, p) => total + Number(p.montoUsd), 0);

  const studentRows = students.map((student) => {
    const activePackages = student.hourPackages.filter(
      (pkg) => pkg.fechaVencimiento >= now,
    );
    const hoursAvailable = activePackages.reduce(
      (total, pkg) =>
        total + Number(pkg.horasCompradas) - Number(pkg.horasConsumidas),
      0,
    );
    const hoursThisMonth = student.hourPackages
      .filter((pkg) => pkg.fechaCompra >= monthStart)
      .reduce((total, pkg) => total + Number(pkg.horasCompradas), 0);
    const totalSpentUsd = student.hourPackages.reduce(
      (total, pkg) => total + Number(pkg.montoUsd),
      0,
    );
    const nextExpiration = activePackages
      .map((pkg) => pkg.fechaVencimiento)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return {
      id: student.id,
      nombre: student.nombre,
      email: student.email,
      hoursAvailable,
      hoursThisMonth,
      totalSpentUsd,
      nextExpiration,
    };
  });

  const hoursSoldThisMonth = studentRows.reduce(
    (total, row) => total + row.hoursThisMonth,
    0,
  );
  const activeStudentCount = studentRows.filter(
    (row) => row.hoursAvailable > 0,
  ).length;

  return (
    <main className="animate-fade-in-up mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Admin dashboard</h1>
          <p className="text-sm text-neutral-600">{user.nombre}</p>
        </div>
        <SignOutButton />
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs text-neutral-600">Students</p>
          <p className="text-2xl font-semibold">{students.length}</p>
          <p className="text-xs text-neutral-500">{activeStudentCount} with hours</p>
        </div>
        <div className="rounded border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs text-neutral-600">Teachers</p>
          <p className="text-2xl font-semibold">{teachers.length}</p>
        </div>
        <div className="rounded border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs text-neutral-600">Hours sold this month</p>
          <p className="text-2xl font-semibold">{hoursSoldThisMonth}</p>
        </div>
        <div className="rounded border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs text-neutral-600">Revenue this month</p>
          <p className="text-2xl font-semibold">
            {formatUsd(revenueThisMonthUsd)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatUsd(totalRevenueUsd)} all-time
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Students</h2>
        {studentRows.length === 0 ? (
          <p className="text-sm text-neutral-600">No students registered yet.</p>
        ) : (
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-neutral-50 text-xs text-neutral-600 dark:bg-neutral-900">
                <tr>
                  <th className="px-3 py-2 font-medium">Student</th>
                  <th className="px-3 py-2 font-medium">Hours available</th>
                  <th className="px-3 py-2 font-medium">Bought this month</th>
                  <th className="px-3 py-2 font-medium">Total spent</th>
                  <th className="px-3 py-2 font-medium">Next expiration</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium">{row.nombre}</div>
                      <div className="text-xs text-neutral-500">{row.email}</div>
                    </td>
                    <td className="px-3 py-2">{row.hoursAvailable}</td>
                    <td className="px-3 py-2">{row.hoursThisMonth}</td>
                    <td className="px-3 py-2">{formatUsd(row.totalSpentUsd)}</td>
                    <td className="px-3 py-2">
                      {row.nextExpiration
                        ? DateTime.fromJSDate(row.nextExpiration).toFormat(
                            "dd LLL yyyy",
                          )
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-start gap-2">
                        <PromoteStudentButton userId={row.id} />
                        <DeleteUserButton userId={row.id} nombre={row.nombre} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Teachers</h2>
        <div className="mb-4">
          <InviteTeacherForm />
        </div>
        {teachers.length === 0 ? (
          <p className="text-sm text-neutral-600">No teachers yet.</p>
        ) : (
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-neutral-50 text-xs text-neutral-600 dark:bg-neutral-900">
                <tr>
                  <th className="px-3 py-2 font-medium">Teacher</th>
                  <th className="px-3 py-2 font-medium">Languages</th>
                  <th className="px-3 py-2 font-medium">Timezone</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b transition-colors last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium">{teacher.user.nombre}</div>
                      <div className="text-xs text-neutral-500">{teacher.user.email}</div>
                    </td>
                    <td className="px-3 py-2">
                      {teacher.idiomas.map((i) => idiomaLabels[i]).join(", ")}
                    </td>
                    <td className="px-3 py-2">{teacher.zonaHoraria}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-start gap-2">
                        <EditTeacherButton
                          teacherId={teacher.id}
                          idiomas={teacher.idiomas}
                          zonaHoraria={teacher.zonaHoraria}
                        />
                        <DeleteUserButton
                          userId={teacher.user.id}
                          nombre={teacher.user.nombre}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
