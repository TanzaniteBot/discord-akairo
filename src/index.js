// @ts-check
"use strict";

import AkairoClient from "./struct/AkairoClient";
import AkairoHandler from "./struct/AkairoHandler";
import AkairoModule from "./struct/AkairoModule";
import ClientUtil from "./struct/ClientUtil";
import Command from "./struct/commands/Command";
import CommandHandler from "./struct/commands/CommandHandler";
import CommandUtil from "./struct/commands/CommandUtil";
import Flag from "./struct/commands/Flag";
import Argument from "./struct/commands/arguments/Argument";
import TypeResolver from "./struct/commands/arguments/TypeResolver";
import Inhibitor from "./struct/inhibitors/Inhibitor";
import InhibitorHandler from "./struct/inhibitors/InhibitorHandler";
import Listener from "./struct/listeners/Listener";
import ListenerHandler from "./struct/listeners/ListenerHandler";
import Task from "./struct/tasks/Task";
import TaskHandler from "./struct/tasks/TaskHandler";
import AkairoError from "./util/AkairoError";
import AkairoMessage from "./util/AkairoMessage";
import Category from "./util/Category";
import * as Constants from "./util/Category";
import Util from "./util/Util";
import packagedotjson from "../package.json";

export default {
	// Core
	AkairoClient,
	AkairoHandler,
	AkairoModule,
	ClientUtil,

	// Commands
	Command,
	CommandHandler,
	CommandUtil,
	Flag,

	// Arguments
	Argument,
	TypeResolver,

	// Inhibitors
	Inhibitor,
	InhibitorHandler,

	// Listeners
	Listener,
	ListenerHandler,

	// Tasks
	Task,
	TaskHandler,

	// Utilities
	AkairoError,
	AkairoMessage,
	Category,
	Constants,
	Util,
	version: packagedotjson.version
};
