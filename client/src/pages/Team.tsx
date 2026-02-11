import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { useTeam, useCreateTeamMember, useDeleteTeamMember } from "@/hooks/use-team";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GraduationCap, Mail, Phone, Code2, Database, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamMemberSchema } from "@shared/schema";
import { z } from "zod";

type TeamFormValues = z.infer<typeof insertTeamMemberSchema>;

export default function Team() {
  const { data: team } = useTeam();
  const { mutate: addMember, isPending } = useCreateTeamMember();
  const { mutate: deleteMember } = useDeleteTeamMember();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: { name: "", enrollmentNumber: "", rollNumber: "", phoneNumber: "", email: "" }
  });

  const onSubmit = (data: TeamFormValues) => {
    addMember(data, { 
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <PageHeader title="Credits & Team" description="Project contributors and technology stack.">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="w-4 h-4 mr-2" /> Add Contributor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...form.register("name")} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Enrollment No.</Label>
                    <Input {...form.register("enrollmentNumber")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Roll No.</Label>
                    <Input {...form.register("rollNumber")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...form.register("email")} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...form.register("phoneNumber")} />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="grid grid-cols-1 gap-12">
          {/* Tech Stack Section */}
          <section>
             <h2 className="text-xl font-bold font-display mb-6 text-slate-800 border-b pb-2">Technology Stack</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50/50 border-blue-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Code2 className="w-5 h-5" /></div>
                      <h3 className="font-semibold text-blue-900">Frontend</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• React.js + TypeScript</li>
                      <li>• Tailwind CSS + Shadcn UI</li>
                      <li>• TanStack Query</li>
                      <li>• Recharts Visualization</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 border-emerald-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Database className="w-5 h-5" /></div>
                      <h3 className="font-semibold text-emerald-900">Backend</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• Node.js + Express</li>
                      <li>• PostgreSQL Database</li>
                      <li>• Drizzle ORM</li>
                      <li>• Passport.js Auth</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50/50 border-purple-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><TrendingUp className="w-5 h-5" /></div>
                      <h3 className="font-semibold text-purple-900">Data Science</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• ARIMA Forecasting</li>
                      <li>• LSTM Neural Networks</li>
                      <li>• Predictive Analytics</li>
                      <li>• Trend Analysis</li>
                    </ul>
                  </CardContent>
                </Card>
             </div>
          </section>

          {/* Team Section */}
          <section>
            <h2 className="text-xl font-bold font-display mb-6 text-slate-800 border-b pb-2">Project Contributors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team?.map((member) => (
                <Card key={member.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                   <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
                   <CardContent className="pt-6 pl-6">
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                         <p className="text-sm text-blue-600 font-medium">{member.rollNumber}</p>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={() => deleteMember(member.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                     
                     <div className="mt-4 space-y-2 text-sm text-slate-500">
                        {member.enrollmentNumber && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <span>{member.enrollmentNumber}</span>
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{member.phoneNumber}</span>
                          </div>
                        )}
                     </div>
                   </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
