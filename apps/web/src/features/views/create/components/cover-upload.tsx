'use client';

import { ImageIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

type CoverUploadProps = {
    name: string;
};

export default function CoverUpload({ name }: CoverUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
    }

    function handleClear() {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    }

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
            {preview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
                    <Image src={preview} alt="Cover preview" fill className="object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleClear}
                    >
                        <XIcon className="size-4" />
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-ring transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ImageIcon className="size-8" />
                    <span className="text-sm font-medium">Upload cover image</span>
                    <span className="text-xs">PNG, JPG up to 5MB</span>
                </button>
            )}
        </div>
    );
}
