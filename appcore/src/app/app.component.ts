import * as _ from "lodash";
import { Component, ComponentFactoryResolver, ElementRef, HostListener, Inject, OnDestroy, OnInit, Renderer2, Type, ViewChild, ViewContainerRef } from "@angular/core";
import { GuardsCheckEnd, NavigationEnd, Router, RouterEvent } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatIconRegistry } from "@angular/material/icon";
import { MatSidenav } from "@angular/material/sidenav";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SideNavService } from "./shared/services/side-nav/side-nav.service";
import { SideNavStatus } from "./shared/services/side-nav/side-nav-status.enum";
import { Subscription } from "rxjs";
import { WindowService } from "./shared/services/window/window.service";
import { DomSanitizer } from "@angular/platform-browser";
import { OverlayContainer } from "@angular/cdk/overlay";
import { Theme } from "./shared/enums/theme.enum";
import { EnvTarget } from "@elevate/shared/models";
import { environment } from "../environments/environment";
import { SYNC_MENU_COMPONENT, SyncMenuComponent } from "./sync-menu/sync-menu.component";
import { SyncMenuDirective } from "./sync-menu/sync-menu.directive";
import { TopBarDirective } from "./top-bar/top-bar.directive";
import { TOP_BAR_COMPONENT, TopBarComponent } from "./top-bar/top-bar.component";
import { SYNC_BAR_COMPONENT, SyncBarComponent } from "./sync-bar/sync-bar.component";
import { SyncBarDirective } from "./sync-bar/sync-bar.directive";
import { LoggerService } from "./shared/services/logging/logger.service";
import { MENU_ITEMS_PROVIDER, MenuItemModel, MenuItemsProvider } from "./shared/services/menu-items/menu-items-provider.interface";
import { APP_MORE_MENU_COMPONENT, AppMoreMenuComponent } from "./app-more-menu/app-more-menu.component";
import { AppMoreMenuDirective } from "./app-more-menu/app-more-menu.directive";
import { REFRESH_STATS_BAR_COMPONENT, RefreshStatsBarComponent } from "./refresh-stats-bar/refresh-stats-bar.component";
import { RefreshStatsBarDirective } from "./refresh-stats-bar/refresh-stats-bar.directive";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {

    public static readonly DISPLAY_INIT_SPLASH_SCREEN_MILLIS: number = 1000;
    public static readonly DEFAULT_SIDE_NAV_STATUS: SideNavStatus = SideNavStatus.OPENED;
    public static readonly LS_SIDE_NAV_OPENED_KEY: string = "app_sideNavOpened";
    public static readonly LS_USER_THEME_PREF: string = "theme";
    public envTarget: EnvTarget = environment.target;
    public EnvTarget = EnvTarget;
    public Theme = Theme;
    public currentTheme: Theme;
    public mainMenuItems: MenuItemModel[];
    public isAppUseAllowed;
    public isAppInitialized;
    public toolBarTitle: string;
    public routerEventsSubscription: Subscription;
    @ViewChild("appContainer", {static: true})
    public appContainer: ElementRef;
    @ViewChild(TopBarDirective, {static: true})
    public topBarDirective: TopBarDirective;
    @ViewChild(SyncBarDirective, {static: true})
    public syncBarDirective: SyncBarDirective;
    @ViewChild(RefreshStatsBarDirective, {static: true})
    public refreshStatsBarDirective: RefreshStatsBarDirective;
    @ViewChild(SyncMenuDirective, {static: true})
    public syncMenuDirective: SyncMenuDirective;
    @ViewChild(AppMoreMenuDirective, {static: true})
    public appMoreMenuDirective: AppMoreMenuDirective;
    @ViewChild(MatSidenav, {static: true})
    public sideNav: MatSidenav;

    constructor(public router: Router,
                public dialog: MatDialog,
                public snackBar: MatSnackBar,
                public sideNavService: SideNavService,
                public windowService: WindowService,
                public overlayContainer: OverlayContainer,
                public renderer: Renderer2,
                public iconRegistry: MatIconRegistry,
                public sanitizer: DomSanitizer,
                public logger: LoggerService,
                public componentFactoryResolver: ComponentFactoryResolver,
                @Inject(MENU_ITEMS_PROVIDER) public menuItemsProvider: MenuItemsProvider,
                @Inject(TOP_BAR_COMPONENT) public topBarComponentType: Type<TopBarComponent>,
                @Inject(SYNC_BAR_COMPONENT) public syncBarComponentType: Type<SyncBarComponent>,
                @Inject(REFRESH_STATS_BAR_COMPONENT) public refreshStatsBarComponentType: Type<RefreshStatsBarComponent>,
                @Inject(SYNC_MENU_COMPONENT) public syncMenuComponentType: Type<SyncMenuComponent>,
                @Inject(APP_MORE_MENU_COMPONENT) public appMoreMenuComponentType: Type<AppMoreMenuComponent>) {
        this.isAppUseAllowed = false;
        this.isAppInitialized = false;
        this.registerCustomIcons();
    }

    public static convertRouteToTitle(route: string): string {

        if (_.isEmpty(route)) {
            return null;
        }

        const routeAsArray: string[] = _.split(route, "/");

        if (_.isEmpty(_.first(routeAsArray))) {
            routeAsArray.shift(); // Remove first element if empty (occurs when first char is "/")
        }

        let title = _.first(routeAsArray);
        title = _.first(title.split("?")); // Remove GET Params from route

        return _.startCase(_.upperFirst(title));
    }

    public ngOnInit(): void {

        this.routerEventsSubscription = this.router.events.subscribe((routerEvent: RouterEvent) => {

            if (routerEvent instanceof GuardsCheckEnd) {
                if (routerEvent.shouldActivate && !this.isAppInitialized) { // Then init app
                    setTimeout(() => {
                        this.isAppUseAllowed = routerEvent.shouldActivate;
                        this.initApp();
                    }, AppComponent.DISPLAY_INIT_SPLASH_SCREEN_MILLIS);
                }

                if (!routerEvent.shouldActivate) {
                    this.appContainer.nativeElement.remove();
                }
            }

            if (routerEvent instanceof NavigationEnd) {
                const route: string = (<NavigationEnd> routerEvent).urlAfterRedirects;
                this.toolBarTitle = AppComponent.convertRouteToTitle(route);
            }
        });
    }

    public initApp(): void {

        // Inject top bar, sync bar, sync menu
        this.injectHotComponent<TopBarComponent>(this.topBarComponentType, this.topBarDirective.viewContainerRef);
        this.injectHotComponent<SyncBarComponent>(this.syncBarComponentType, this.syncBarDirective.viewContainerRef);
        this.injectHotComponent<RefreshStatsBarComponent>(this.refreshStatsBarComponentType, this.refreshStatsBarDirective.viewContainerRef);
        this.injectHotComponent<SyncMenuComponent>(this.syncMenuComponentType, this.syncMenuDirective.viewContainerRef);
        this.injectHotComponent<AppMoreMenuComponent>(this.appMoreMenuComponentType, this.appMoreMenuDirective.viewContainerRef);

        this.setupThemeOnLoad();

        // Update list of sections names displayed in sidebar
        this.mainMenuItems = this.menuItemsProvider.getMenuItems();
        _.forEach(this.mainMenuItems, (menuItemModel: MenuItemModel) => {
            menuItemModel.name = AppComponent.convertRouteToTitle(menuItemModel.routerLink);
        });

        this.sideNavSetup();

        this.isAppInitialized = true;

        this.logger.info("App initialized.");
    }

    public injectHotComponent<C>(component: Type<C>, targetViewRef: ViewContainerRef): C {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        return <C> targetViewRef.createComponent(componentFactory).instance;
    }

    public sideNavSetup(): void {

        this.sideNav.opened = (AppComponent.DEFAULT_SIDE_NAV_STATUS === SideNavStatus.OPENED);

        const sideNavOpened: string = localStorage.getItem(AppComponent.LS_SIDE_NAV_OPENED_KEY);
        if (sideNavOpened) {
            this.sideNav.opened = (sideNavOpened === "true");
        }
    }

    public setupThemeOnLoad(): void {

        let themeToBeLoaded: Theme = Theme.DEFAULT;

        const existingSavedTheme = localStorage.getItem(AppComponent.LS_USER_THEME_PREF) as Theme;

        if (existingSavedTheme) {
            themeToBeLoaded = existingSavedTheme;
        }

        this.setTheme(themeToBeLoaded);
    }

    public setTheme(theme: Theme): void {

        this.currentTheme = theme;

        // Remove previous theme if exists
        const previousTheme = this.overlayContainer.getContainerElement().classList[1] as Theme;
        if (previousTheme) {
            this.overlayContainer.getContainerElement().classList.remove(previousTheme);
        }

        // Add theme/class to overlay list
        this.overlayContainer.getContainerElement().classList.add(this.currentTheme);

        // Change body theme class
        this.renderer.setAttribute(document.body, "class", this.currentTheme);
    }

    @HostListener("window:resize")
    public setupWindowResizeBroadcast(): void {
        this.windowService.onResize(); // When user resize the window. Tell it to subscribers
    }

    public onThemeToggle(): void {
        const targetTheme = (this.currentTheme === Theme.LIGHT) ? Theme.DARK : Theme.LIGHT;
        this.setTheme(targetTheme);
        localStorage.setItem(AppComponent.LS_USER_THEME_PREF, targetTheme);
    }

    public onSideNavClosed(): void {
        this.sideNavService.onChange(SideNavStatus.CLOSED);
    }

    public onSideNavOpened(): void {
        this.sideNavService.onChange(SideNavStatus.OPENED);
    }

    public onSideNavToggle(): void {
        this.sideNav.toggle();
        localStorage.setItem(AppComponent.LS_SIDE_NAV_OPENED_KEY, (this.sideNav.opened) ? "true" : "false");
    }

    public registerCustomIcons(): void {
        this.iconRegistry.addSvgIcon("strava", this.sanitizer.bypassSecurityTrustResourceUrl("./assets/icons/strava.svg"));
    }

    public ngOnDestroy(): void {
        this.routerEventsSubscription.unsubscribe();
    }

    public onOpenLink(url: string) {
        window.open(url, "_blank");
    }
}
