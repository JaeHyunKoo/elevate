import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import * as MarkDownIt from "markdown-it";
import { LoggerService } from "../shared/services/logging/logger.service";

@Component({
    selector: "app-faq",
    templateUrl: "./faq.component.html",
    styleUrls: ["./faq.component.scss"],
})
export class FaqComponent implements OnInit {
    private static readonly FAQ_URL: string =
        "https://raw.githubusercontent.com/wiki/thomaschampagne/elevate/Frequently-Asked-Questions.md";

    public html: string;
    public markDownParser: MarkDownIt;

    public isFaqLoaded: boolean = null;

    constructor(public httpClient: HttpClient, public domSanitizer: DomSanitizer, public logger: LoggerService) {}

    public ngOnInit(): void {
        this.markDownParser = new MarkDownIt();

        this.httpClient
            .get(FaqComponent.FAQ_URL, { responseType: "text" })
            .toPromise()
            .then(
                (markdownData: string) => {
                    this.html = this.domSanitizer.bypassSecurityTrustHtml(
                        this.markDownParser.render(markdownData)
                    ) as string;
                    this.isFaqLoaded = true;
                },
                err => {
                    this.logger.error(err);
                }
            );
    }
}
