<?php

namespace Exorgroup\ApexUi\Console;

use Illuminate\Console\Command;

class InstallCommand extends Command
{
    protected $signature = 'apex-ui:install {--published : Serve the prebuilt UMD bundle instead of using Vite}';

    protected $description = 'Install APEX UI: publish config and assets, and print the Vue bootstrap snippet.';

    public function handle(): int
    {
        $this->callSilent('vendor:publish', ['--tag' => 'apex-ui-config', '--force' => true]);
        $this->info('Published config/apex-ui.php');

        if ($this->option('published')) {
            $this->callSilent('vendor:publish', ['--tag' => 'apex-ui-assets', '--force' => true]);
            $this->info('Published dist assets to public/vendor/apex-ui');
            $this->comment('Set APEX_UI_MODE=published in your .env, then add @apexUi to your layout <head>.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->line('1. npm install @exorgroup/apex-ui');
        $this->line('2. In resources/js/app.js:');
        $this->newLine();
        $this->line("   import ApexUI from '@exorgroup/apex-ui';");
        $this->line("   import '@exorgroup/apex-ui/style.css';");
        $this->line("   createApp(App).use(ApexUI, { size: 'md' }).mount('#app');");
        $this->newLine();
        $this->line('3. Add @apexUiTheme and @apexUi to your layout <head>.');

        return self::SUCCESS;
    }
}
