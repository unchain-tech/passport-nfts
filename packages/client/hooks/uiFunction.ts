export const divideList = (
  imgIdList: string[],
  itemNum: number,
): string[][] => {
  let listOfImgIdList: string[][] = new Array();
  let temImgIdList: string[] = new Array();
  imgIdList.map((imgId, i) => {
    if ((i + 1) % itemNum == 0) {
      temImgIdList.push(imgId);
      listOfImgIdList.push(temImgIdList);
      temImgIdList = new Array();
    } else {
      temImgIdList.push(imgId);
    }

    if (i == imgIdList.length - 1) listOfImgIdList.push(temImgIdList);
  });

  return listOfImgIdList;
};
