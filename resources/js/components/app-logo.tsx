import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                    SmartOffice SIMRAD
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    Manajemen Rapat & Dokumen
                </span>
            </div>
        </div>
    );
}
