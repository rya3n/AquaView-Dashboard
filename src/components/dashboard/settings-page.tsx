"use client"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import DashboardLayout from "./dashboard-layout"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

  return (
    <DashboardLayout headerTitle="Configurações">
        <Card>
            <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                Personalize a aparência do aplicativo. Alterne entre o tema claro e escuro.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup 
                    defaultValue={theme} 
                    onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                    className="grid max-w-md grid-cols-2 gap-8 pt-2"
                >
                    <Label className="[&:has([data-state=checked])>div]:border-primary">
                        <RadioGroupItem value="light" className="sr-only" />
                        <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                        </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                        Claro
                        </span>
                    </Label>
                    <Label className="[&:has([data-state=checked])>div]:border-primary">
                        <RadioGroupItem value="dark" className="sr-only" />
                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                        </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                        Escuro
                        </span>
                    </Label>
                </RadioGroup>
            </CardContent>
        </Card>
    </DashboardLayout>
  )
}
