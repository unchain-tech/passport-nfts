import Papa from 'papaparse';

export const divideList = (
  imgIdList: string[],
  itemNum: number,
): string[][] => {
  const listOfImgIdList: string[][] = [];
  let temImgIdList: string[] = [];
  imgIdList.forEach((imgId, i) => {
    if ((i + 1) % itemNum === 0) {
      temImgIdList.push(imgId);
      listOfImgIdList.push(temImgIdList);
      temImgIdList = [];
    } else {
      temImgIdList.push(imgId);
    }

    if (i === imgIdList.length - 1) listOfImgIdList.push(temImgIdList);
  });

  return listOfImgIdList;
};

export const readCSV = (e: any) => {
  if (e !== null) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        console.log(results.data);
      },
    });
  }
};
