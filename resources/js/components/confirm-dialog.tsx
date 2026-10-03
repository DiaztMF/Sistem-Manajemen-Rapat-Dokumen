import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    variant = 'default',
    onConfirm,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="gap-2 sm:text-left">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex size-10 items-center justify-center rounded-full shrink-0 ${
                                variant === 'destructive'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-primary/10 text-primary'
                            }`}
                        >
                            {variant === 'destructive' ? (
                                <AlertTriangle className="size-5" />
                            ) : (
                                <Info className="size-5" />
                            )}
                        </div>
                        <DialogTitle className="text-base font-semibold">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground pt-1">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        disabled={loading}
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        {loading ? 'Memproses...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
