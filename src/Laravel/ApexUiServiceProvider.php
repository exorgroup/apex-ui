<?php

namespace Exorgroup\ApexUi;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class ApexUiServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../../config/apex-ui.php', 'apex-ui');
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/../../config/apex-ui.php' => config_path('apex-ui.php'),
        ], 'apex-ui-config');

        $this->publishes([
            __DIR__ . '/../../dist' => public_path('vendor/apex-ui'),
        ], 'apex-ui-assets');

        if ($this->app->runningInConsole()) {
            $this->commands([Console\InstallCommand::class]);
        }

        // @apexUi — emits the stylesheet, the icon font, and (when not using Vite) the UMD bundle.
        Blade::directive('apexUi', fn () => "<?php echo app('" . AssetManager::class . "')->tags(); ?>");

        // @apexUiTheme — inline script that applies the stored/system theme before first paint.
        Blade::directive('apexUiTheme', fn () => "<?php echo app('" . AssetManager::class . "')->themeScript(); ?>");

        $this->app->singleton(AssetManager::class, fn ($app) => new AssetManager($app['config']['apex-ui']));
    }
}
