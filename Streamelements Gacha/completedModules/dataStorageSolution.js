// Concurency mitigation, store data with eventId as an array, append data to array periodically
// every so often, or when the user requests it, convert array to a set and

/**
 *
 * @param {string} key
 * @param {string} localArray
 * @returns {string} de-duplicated union value
 */
async function hardUpdateKVstoreArray(key, localArray) {
  const kVArray = await SE_API.store.get(key);
  if (!Array.isArray(kVArray)) {
    return new Error("This KV store does not contain an array");
  }

  const deDupedUnion = new Set([...kVArray, ...localArray]); // transforms arrays into set to remove duplicates
  SE_API.store.set(key, deDupedUnion); // pushes the deduped array back into the KVstore
  localArray.length = 0; // clean up localArray
  return deDupedUnion;
}

// Send a socket event that can be caught by onEventListener('onEventReceived') on any custom widget
async function requestGachaUpdate(channelId, apiToken) {
  fetch(
    `https://api.streamelements.com/kappa/v2/channels/${channelId}/socket`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `apikey ${apiToken}`,
      },
      body: JSON.stringify({
        event: "event",
        data: {
          channel: channelId,
          type: "gachaUpdate",
        },
      }),
    }
  );
}

// gacha update event check
if (obj.data.type === "gachaUpdate") {
  hardUpdateKVstoreArray(key, localArray);
}

// default update function on start or when requested
async function fetchkVStoreArray(key, localArray) {
    const kVArray = await SE_API.store.get(key);
    if (kVArray === undefined) {SE_API.store.set(key, [])}
    if (!Array.isArray(kVArray)) {
      return new Error("This KV store does not contain an array");
    }

    localArray = kVArray;
    return kVArray;
}

// soft array update module
function kVStoreArraySoftUpdater(key, localArray) {
  setInterval(async () => {
    const kVArray = await SE_API.store.get(key);
    if (!Array.isArray(kVArray)) {
      return new Error("This KV store does not contain an array");
    }

    const latestStoredEntry = kVArray[kVArray.length - 1];
    const latestLocalEntry = localArray[localArray.length - 1];
    // returns if no new events were created
    if (latestStoredEntry === latestLocalEntry) {
      return;
    }

    let updatedArray = [];
    if (localArray.includes(latestStoredEntry)) {
        // updates kVArray from the point where the last index was stored
        updatedArray = kVArray.concat(localArray.slice(localArray.indexOf(latestStoredEntry) + 1));
    } else {
        updatedArray = kVArray.concat(localArray);
    }

    await SE_API.store.set(key, updatedArray);
    // empties out local array to free up local memory
    localArray.length = 0;
  }, 900000);
}
