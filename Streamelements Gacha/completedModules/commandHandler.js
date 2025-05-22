const commandDispatchTable = {
    ROLL: (name)=>{/* roll gacha once */},
    ROLLCOUNT: (count)=>{/* roll gacha ${count} times*/}
}
/**
 * 
 * @param {string} messageString 
 */
function commandHandler(messageString) {
    // sets up first level of checking, exits function if not command format
    const isCommandRegex = /^\+[a-z0-9]+/i;
    if (!isCommandRegex.test(messageString)) return;

    return executeCommand(messageString);
}
/**
 * 
 * @param {string} commandString
 * @returns confirmation on success, error message on error
 */
function executeCommand(commandString) {
    // tokenizing: slice to remove command character
    const tokenArray = commandString.slice(1).split(" ");
    const commandSignature = tokenArray.shift().toUpperCase();
    const commandArguments = tokenArray.slice(1);

    let recognizedCommand = commandDispatchTable[commandSignature]; // function or null
    if (recognizedCommand === undefined) {return "Command not found"};
    if (commandArguments.length < recognizedCommand.length) {return "Command signature incomplete"};

    try {
        return recognizedCommand(...commandArguments);   
    } catch (error) {
        console.error("Command execution error:", error);
        return `Error occured when executing command: ${commandSignature}`;
    }
}