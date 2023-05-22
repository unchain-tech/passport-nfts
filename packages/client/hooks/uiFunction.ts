export const divideList = (
  passportHashes: string[],
  itemNum: number,
): string[][] => {
  const listOfImgIdList: string[][] = [];
  let temImgIdList: string[] = [];
  passportHashes.forEach((passportHash, i) => {
    if ((i + 1) % itemNum === 0) {
      temImgIdList.push(passportHash);
      listOfImgIdList.push(temImgIdList);
      temImgIdList = [];
    } else {
      temImgIdList.push(passportHash);
    }

    if (i === passportHashes.length - 1) listOfImgIdList.push(temImgIdList);
  });

  return listOfImgIdList;
};

export const convertToProjectAddresses = (
  projectAddresses: string[],
  projectNames: string[],
  targets: string[],
): string[] => {
  const getAddresses = [];
  for (const target of targets) {
    const index = projectNames.indexOf(target);
    if (index === -1) {
      throw new Error(`Unknown project name "${target}"`);
    }
    getAddresses.push(projectAddresses[index]);
  }
  return getAddresses;
};
