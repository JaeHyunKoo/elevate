import { ErrorHandler, Injectable } from "@angular/core";
import { LoggerService } from "./shared/services/logging/logger.service";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../environments/environment";
import { EnvTarget } from "@elevate/shared/models";

@Injectable()
export class ElevateErrorHandler implements ErrorHandler {

	constructor(public dialog: MatDialog,
				public loggerService: LoggerService) {

	}

	public handleError(error: Error): void {
		const message = (error.message) ? error.message : error;
		const stackTrace = (error.message) ? error.stack : null;
		const consoleShortcut = (environment.target === EnvTarget.DESKTOP) ? "CTRL+F12" : "F12";
		alert("Whoops an error occurred: \n\n" + message + "\n\n\n\n(Press " + consoleShortcut + " to get more details in console)");
		this.loggerService.error(error);
	}
}
