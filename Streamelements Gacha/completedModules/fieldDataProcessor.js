// NOTES: below is the group of functions that will be added
// in to promote user experience, many of these are reusable, but
// they are all supposed to only work in the Streamelements environment
// there will be notes below explaining what to change to get things to 
// run in node

// reminder that the field setting functions and dynamic UI checks should
// be contained within an isEditorMode check

const obj = {
  detail: {
    fieldData: {
      "_iGroup2-settings-weight": 2,
      "_iGroup2-settings-media": "image",
      "_iGroup2-image-time": 10,
      "_iGroup2-video-media": "videoURL2",
      "_iGroup2-image-media": "imageURL2",
      "_iGroup2-image-audio": "audioURL2",
      "_iGroup2-primary-label": "Tier 2",
      "_iGroup2-separator-video": "",
      "_iGroup2-separator-image": "",

      "_iGroup3-settings-weight": 3,
      "_iGroup3-settings-media": "video",
      "_iGroup3-image-time": 12,
      "_iGroup3-video-media": "videoURL3",
      "_iGroup3-image-media": "imageURL3",
      "_iGroup3-image-audio": "audioURL3",
      "_iGroup3-primary-label": "Tier 3",
      "_iGroup3-separator-video": "",
      "_iGroup3-separator-image": "",

      "_iGroup4-settings-weight": 4,
      "_iGroup4-settings-media": "image",
      "_iGroup4-image-time": 14,
      "_iGroup4-video-media": "videoURL4",
      "_iGroup4-image-media": "imageURL4",
      "_iGroup4-image-audio": "audioURL4",
      "_iGroup4-primary-label": "Tier 4",
      "_iGroup4-separator-video": "",
      "_iGroup4-separator-image": "",

      "_iGroup5-settings-weight": 5,
      "_iGroup5-settings-media": "video",
      "_iGroup5-image-time": 16,
      "_iGroup5-video-media": "videoURL5",
      "_iGroup5-image-media": "imageURL5",
      "_iGroup5-image-audio": "audioURL5",
      "_iGroup5-primary-label": "Tier 5",
      "_iGroup5-separator-video": "",
      "_iGroup5-separator-image": "",
      
      "_iGroup1-settings-weight": 1,
      "_iGroup1-settings-media": "video",
      "_iGroup1-image-time": 8,
      "_iGroup1-video-media": "someURL",
      "_iGroup1-image-media": "someURL",
      "_iGroup1-image-audio": "someURL",
      "_iGroup1-primary-label": "Tier 1",
      "_iGroup1-separator-video": "",
      "_iGroup1-separator-image": "",
    },
  },
};

// is almost generic, modification to The first 2 variables
// allows the dev to change the fieldData formatting
function extractSpecialFieldData(fieldData) {
  const wantedFieldRegex = /^_iGroup[0-9]\-[A-Za-z0-9]+\-[A-Za-z0-9]+/i;
  const groupKeyRegex = /_iGroup[0-9]/i;
  const iGroups = {};

  for (let field in fieldData) {
    if (wantedFieldRegex.test(field)) {
      // checks the fieldData string is part of the input parameters
      const tokenArray = field.split("-");
      const iGroupKey = groupKeyRegex.exec(field)[0];
      const groupPath = tokenArray.slice(1); // remove _iGroupN
      const groupValue = groupPath.pop(); // remove value

      // Initialize the group object if not present
      iGroups[iGroupKey] ||= {};

      // Build nested structure dynamically
      let current = iGroups[iGroupKey];
      groupPath.forEach((group) => {
        current[group] ||= {};
        current = current[group];
      });

      // Assign the value to the last element
      current[groupValue] = fieldData[field];
    }
  }
  return iGroups;
}

function setField(field, value) {
  // comment stdout in SE editor, comment SE_API in node env
  process.stdout.write("\r" + value);
  // SE_API.setField(field, value, false);
}

/**
 * 
 * @param {string} field - fieldData name tag 
 * @param {string} text - text to scroll on page
 * @param {number} loopCount - [options] how many times the animation should loop, infinite if no input
 */
function animateField(field, text, loopCount = null) {
  // slipts the input arrays and constructs the final display payload
  const textArr = text.split(" ");
  const emptyBuffer = textArr.map((subStr) => " ".repeat(subStr.length));
  const textLength = textArr.length;
  const concatedArr = [...emptyBuffer, ...textArr, ...emptyBuffer];
  const totalFrames = concatedArr.length - textLength + 1;

  // loops a "frame", the text that is supposed to be displayed in the field
  let index = 0;
  let intervalCount = 0;
  const interval = setInterval(() => {
    const frame = concatedArr.slice(index, index + textLength).join(" ");
    setField(field, frame);
    index = (index + 1) % totalFrames;
    intervalCount++;

    // repeat count
    if (intervalCount >= totalFrames * loopCount) {
      setField(field, "");
      clearInterval(interval);
    }
  }, 250);
}

// dynamic user input fields
// is not a generic approach to form input enforcement, will have to be
// changed for each implementation
function dynamicUIsettings(iGroups) {
  const iTypeWarning = (type) =>
    `This input group has been set to ${type}, the below values will not be set`;

  for (let iGroup in iGroups) {
    if (iGroups?.[iGroup]?.settings?.media === "video") {
      setField(`${iGroup}-separator-video`, "");
      animateField(`${iGroup}-separator-image`, iTypeWarning("Video"), 5);
      setField(`${iGroup}-image-media`, "");
      setField(`${iGroup}-image-media`, "");
    } else {
      setField(`${iGroup}-separator-image`, "");
      animateField(`${iGroup}-separator-video`, iTypeWarning("Image"), 5);
      setField(`${iGroup}-video-media`, "");
    }
  }
}

/**
 * custom prefix sum array factory, works only for the specific gacha widget grouping setup
 * @param {iGroups} iGroups - object containing input setting objects 
 */
function prefixSumArrayFactory(iGroups) {
  class WeightedIndex {
    constructor(weight, gObject) {
      (this.weight = weight), (this.value = gObject);
    }
  }
  const prefixSumArray = [];

  class GObject {
    constructor(tierLabel, mediaUrl, audioUrl, duration) {
      this.tier = tierLabel,
      this.media = mediaUrl,
      this.audio = audioUrl,
      this.duration = duration
    }
  }

  // filter out iGroups with lacking inputs
  for (let iGroup in iGroups) {
    if (iGroups?.[iGroup]?.primary?.label?.trim()) {
      let weight = iGroups?.[iGroup]?.settings.weight ?? 1;
      const gObject = new GObject(
        iGroups?.[iGroup]?.primary?.label ?? null,
        // _Dev_comment: this is set up like this purely becuase I think it looks pretty: 
        // behavior: if video URL is not found, try image url, if both are not found, set to null
        iGroups?.[iGroup]?.video?.media ?? iGroups?.[iGroup]?.image?.media ?? null,
        iGroups?.[iGroup]?.image?.audio ?? null,
        iGroups?.[iGroup]?.image?.duration ?? null,
      )
      prefixSumArray.push(new WeightedIndex(weight, gObject));
    }
  }

  return prefixSumArray;
}


let iGroups = extractSpecialFieldData(obj.detail.fieldData);
let prefixSumArray = prefixSumArrayFactory(iGroups);
console.log(prefixSumArray);
// dynamicUIsettings(iGroups);

