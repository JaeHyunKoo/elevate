import { AthleteModel } from "../models/athlete";
import { DatedAthleteSettingsModel } from "../models/athlete/athlete-settings";
import { UserSettingsModel } from "../models/user-settings";
import * as _ from "lodash";
import { userSettingsData } from "../data";

/**
 * Shared by core and app to resolve AthleteModel for a given activity date
 */
export class AthleteModelResolver {

	public userSettingsModel: UserSettingsModel;

	public datedAthleteSettingsModels: DatedAthleteSettingsModel[];

	constructor(userSettingsModel: UserSettingsModel, datedAthleteSettingsModels: DatedAthleteSettingsModel[]) {
		this.userSettingsModel = userSettingsModel;
		this.datedAthleteSettingsModels = _.sortBy(datedAthleteSettingsModels, (model: DatedAthleteSettingsModel) => {
			const sortOnDate: Date = (_.isNull(model.since)) ? new Date(0) : new Date(model.since);
			return sortOnDate.getTime() * -1;
		});
	}

	/**
	 * Resolve the proper AthleteModel along UserSettingsModel.hasDatedAthleteSettings and activity date
	 * @param onDate Date format YYYY-MM-DD or Date object
	 * @returns {AthleteModel}
	 */
	public resolve(onDate: string | Date): AthleteModel {

		let onDateString: string;

		if (onDate instanceof Date) {

			const isValidDate = !isNaN(onDate.getTime());

			if (!isValidDate) {
				return (this.userSettingsModel.athleteModel) ? this.userSettingsModel.athleteModel : _.cloneDeep(userSettingsData.athleteModel);
			}

			onDateString = this.shortDateAsString(onDate);

		} else {

			if (_.isEmpty(onDate)) {
				return (this.userSettingsModel.athleteModel) ? this.userSettingsModel.athleteModel : _.cloneDeep(userSettingsData.athleteModel);
			}

			onDateString = onDate;
		}

		// Use default AthleteModel if current in settings doesn't exists
		if (!this.userSettingsModel.athleteModel) {
			this.userSettingsModel.athleteModel = _.cloneDeep(userSettingsData.athleteModel);
		}

		const hasDatedAthleteSettings: boolean = this.userSettingsModel.hasDatedAthleteSettings;

		let athleteModel: AthleteModel;
		if (hasDatedAthleteSettings) {
			// Find the local AthleteModel for the given date
			const datedAthleteSettingsModel: DatedAthleteSettingsModel = this.resolveDatedAthleteSettingsAtDate(onDateString);
			// If datedAthleteSettingsModel found use it, instead use 'classic' AthleteSettingsModel
			athleteModel = (datedAthleteSettingsModel) ? new AthleteModel(this.userSettingsModel.athleteModel.gender, datedAthleteSettingsModel.toAthleteSettingsModel())
				: new AthleteModel(this.userSettingsModel.athleteModel.gender, this.userSettingsModel.athleteModel.athleteSettings);

		} else {
			athleteModel = new AthleteModel(this.userSettingsModel.athleteModel.gender, this.userSettingsModel.athleteModel.athleteSettings);
		}

		return athleteModel;
	}

	public getCurrent(): AthleteModel {
		return this.resolve((new Date()));
	}

	public resolveDatedAthleteSettingsAtDate(onDate: string): DatedAthleteSettingsModel {

		const onDateTime: number = new Date(onDate).getTime();

		const datedAthleteSettingsModel: DatedAthleteSettingsModel = _.find(this.datedAthleteSettingsModels, (datedAthleteSettings: DatedAthleteSettingsModel) => {
			const fromDate = (datedAthleteSettings.since) ? new Date(datedAthleteSettings.since) : new Date(0);
			return onDateTime >= fromDate.getTime();
		});

		return (datedAthleteSettingsModel) ? DatedAthleteSettingsModel.asInstance(datedAthleteSettingsModel) : null;
	}

	public shortDateAsString(date: Date): string {
		return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
	}

}
