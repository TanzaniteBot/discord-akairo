// @ts-check
"use strict";

import AkairoClient from "./struct/AkairoClient.js";
import AkairoHandler from "./struct/AkairoHandler.js";
import AkairoModule from "./struct/AkairoModule.js";
import ClientUtil from "./struct/ClientUtil.js";
import Command from "./struct/commands/Command.js";
import CommandHandler from "./struct/commands/CommandHandler.js";
import CommandUtil from "./struct/commands/CommandUtil.js";
import Flag from "./struct/commands/Flag.js";
import Argument from "./struct/commands/arguments/Argument.js";
import TypeResolver from "./struct/commands/arguments/TypeResolver.js";
import Inhibitor from "./struct/inhibitors/Inhibitor.js";
import InhibitorHandler from "./struct/inhibitors/InhibitorHandler.js";
import Listener from "./struct/listeners/Listener.js";
import ListenerHandler from "./struct/listeners/ListenerHandler.js";
import Task from "./struct/tasks/Task.js";
import TaskHandler from "./struct/tasks/TaskHandler.js";
import AkairoError from "./util/AkairoError.js";
import AkairoMessage from "./util/AkairoMessage.js";
import Category from "./util/Category.js";
import * as Constants from "./util/Constants.js";
import Util from "./util/Util.js";

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
	version: require("../package.json").version
};
