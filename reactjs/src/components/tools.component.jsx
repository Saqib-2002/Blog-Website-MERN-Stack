// importing tools
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

// const uploadImgByUrl = async (e) => {
//   const link = new Promise((resolve, reject) => {
//     try {
//       resolve(e);
//     } catch (err) {
//       reject(err);
//     }
//   });
//   console.log(link);
//   const url = await link;
//   return {
//     success: 1,
//     file: { url },
//   };
// };

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  // image: {
  //   class: Image,
  //   config: {
  //     uploader: {
  //       uploadByUrl: uploadImgByUrl,
  //       // uploadByFile: uploadImgByFile,
  //     },
  //   },
  // },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading...",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
