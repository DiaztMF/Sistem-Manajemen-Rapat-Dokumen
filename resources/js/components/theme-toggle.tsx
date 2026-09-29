import { Monitor, Moon, Sun } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const order: Appearance[] = ['light', 'dark', 'system'];

const labels: Record<Appearance, string> = {
    light: 'Terang',
    dark: 'Gelap',
    system: 'Sistem',
};

export function ThemeToggle({ className }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const next = order[(order.indexOf(appearance) + 1) % order.length];

    const Icon =
        appearance === 'light' ? Sun : appearance === 'dark' ? Moon : Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Ganti tema tampilan"
                    className={className}
                >
                    <Icon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {order.map((mode) => (
                    <DropdownMenuItem
                        key={mode}
                        onClick={() => updateAppearance(mode)}
                        className="gap-2"
                    >
                        {mode === 'light' ? (
                            <Sun className="size-4" />
                        ) : mode === 'dark' ? (
                            <Moon className="size-4" />
                        ) : (
                            <Monitor className="size-4" />
                        )}
                        {labels[mode]}
                        {appearance === mode && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                ✓
                            </span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
