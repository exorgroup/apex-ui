<?php

namespace Exorgroup\ApexUi;

use Illuminate\Support\HtmlString;

class AssetManager
{
    public function __construct(private array $config) {}

    /** Stylesheet + icon font + optional UMD bundle. */
    public function tags(): HtmlString
    {
        $out = [];

        if ($this->config['icons']['enabled'] ?? true) {
            $wght = $this->config['icons']['weight'] ?? 300;
            $out[] = '<link rel="preconnect" href="https://fonts.googleapis.com">';
            $out[] = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
            // the FILL axis must stay a range so solid glyphs work; $wght only sets the default weight
            $out[] = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200..700,0..1,0">';
        }

        if (($this->config['mode'] ?? 'vite') === 'published') {
            $base = asset('vendor/apex-ui');
            $out[] = '<link rel="stylesheet" href="' . $base . '/apex-ui.css">';
            $out[] = '<script src="' . $base . '/apex-ui.umd.cjs" defer></script>';
        }

        return new HtmlString(implode("\n", $out));
    }

    /** Applies the persisted theme before paint so dark mode never flashes. */
    public function themeScript(): HtmlString
    {
        $key = $this->config['theme']['storage_key'] ?? 'apex-theme';
        $default = $this->config['theme']['default'] ?? 'system';

        return new HtmlString(<<<HTML
<script>(function(){try{var s=localStorage.getItem('{$key}')||'{$default}';
var d=s==='dark'||(s==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
document.documentElement.classList.toggle('dark',d);
document.documentElement.classList.toggle('light',!d&&s==='light');}catch(e){}})();</script>
HTML);
    }
}
