// import log from "../configs/logger.config.js";
// import {
//   d100MD_SDK_VIDEO_TEMPLATE,
//   d100MD_SDK_VIDEO_URL,
//   d100MD_SDK_TOKEN,
// } from "../configs/server.config.js";

// import axios from "axios";

// const create100msRoom = async () => {
//   try {
//     const roomResponse = await axios.post(
//       "https://api.100ms.live/v2/rooms",
//       {
//         name: `chemistry-lecture-${Date.now()}`,
//         description: `Chemistry Lecture`,
//         template_id: d100MD_SDK_VIDEO_TEMPLATE,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${d100MD_SDK_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const roomId = roomResponse.data.id;

//     // 2. Generate codes
//     const [hostCodeRes, guestCodeRes] = await Promise.all([
//       axios.post(
//         `https://api.100ms.live/v2/room-codes/room/${roomId}/role/host`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${d100MD_SDK_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//         }
//       ),
//       axios.post(
//         `https://api.100ms.live/v2/room-codes/room/${roomId}/role/guest`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${d100MD_SDK_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//         }
//       ),
//     ]);

//     const baseURL = d100MD_SDK_VIDEO_URL;

//     const hostUrl = `https://${baseURL}.app.100ms.live/meeting/${hostCodeRes.data.code}`;
//     const guestUrl = `https://${baseURL}.app.100ms.live/meeting/${guestCodeRes.data.code}`;

//     return {
//       roomId,
//       hostUrl,
//       guestUrl,
//     };
//   } catch (error) {
//     log.error("error from [SERVICE]: ", error);
//     throw error;
//   }
// };
// export { create100msRoom };

import log from "../configs/logger.config.js";
import {
  d100MD_SDK_VIDEO_TEMPLATE,
  d100MD_SDK_VIDEO_URL,
  d100MD_SDK_TOKEN,
} from "../configs/server.config.js";
import axios from "axios";

const create100msRoom = async () => {
  try {
    const roomResponse = await axios.post(
      "https://api.100ms.live/v2/rooms",
      {
        name: `chemistry-lecture-${Date.now()}`,
        description: `Chemistry Lecture`,
        template_id: d100MD_SDK_VIDEO_TEMPLATE,
      },
      {
        headers: {
          Authorization: `Bearer ${d100MD_SDK_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const roomId = roomResponse.data.id;

    const [hostCodeRes, guestCodeRes] = await Promise.all([
      axios.post(
        `https://api.100ms.live/v2/room-codes/room/${roomId}/role/host`,
        {
          user_id: "host_1",
          metadata: { name: "Arun dixit" },
        },
        {
          headers: {
            Authorization: `Bearer ${d100MD_SDK_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      ),
      axios.post(
        `https://api.100ms.live/v2/room-codes/room/${roomId}/role/guest`,
        {},
        {
          headers: {
            Authorization: `Bearer ${d100MD_SDK_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      ),
    ]);

    const baseURL = d100MD_SDK_VIDEO_URL;

    const hostUrl = `https://${baseURL}.app.100ms.live/meeting/${
      hostCodeRes.data.code
    }?name=${encodeURIComponent("Arun dixit")}`;
    const guestUrl = `https://${baseURL}.app.100ms.live/meeting/${guestCodeRes.data.code}`;

    return { roomId, hostUrl, guestUrl };
  } catch (error) {
    log.error("error from [SERVICE]: ", error);
    throw error;
  }
};

export { create100msRoom };
