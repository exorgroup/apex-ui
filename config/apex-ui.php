<?php

return [
    /*
     | 'vite'      — you bundle @exorgroup/apex-ui yourself (default).
     | 'published' — @apexUi emits the prebuilt CSS + UMD bundle from public/vendor/apex-ui.
     */
    'mode' => env('APEX_UI_MODE', 'vite'),

    'icons' => [
        'enabled' => true,
        // Material Symbols Outlined weight axis. 300 = Light.
        'weight' => 300,
    ],

    'theme' => [
        // 'light' | 'dark' | 'system'
        'default' => env('APEX_UI_THEME', 'system'),
        'storage_key' => 'apex-theme',
    ],

    'defaults' => [
        'size' => 'md',
        'label_placement' => 'top',
    ],
];
