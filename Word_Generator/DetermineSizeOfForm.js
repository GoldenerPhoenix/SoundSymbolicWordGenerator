//Function used to determine the size of the drawing:
async function determinesize(img_array) { //Takes the image array with pixel values as input
  //Initialize the important values to be at their "weakest" value.
  highestpixel = 999999999;
  lowestpixel = 0;
  leftmostpixel = 99999999;
  rightmostpixel = 0;
  row = 1
  column = 0
  for (var i = 0; i < img_array.length; i++) {  //Iterate through the array
    column++; //Count up the column
    if(i % 512 == 0) {  //If the end of a row is reached, reset the column and increment the row
      row++;
      column = 1;
    }
    if (img_array[i] != 255) {  //If the pixel value is not 255 (= not white), check if the current pixel position is more extrem than the current max
      if (row < highestpixel) {
        highestpixel = row;
      }
      if (row > lowestpixel) {
        lowestpixel = row;
      }
      if (column < leftmostpixel) {
        leftmostpixel = column;
      }
      if (column > rightmostpixel) {
        rightmostpixel = column;
      }
    }
  }
  height = lowestpixel - highestpixel;      //calculate height
  width = rightmostpixel - leftmostpixel;   //calculate width
  size = (height / 383 + width / 511) / 2 //normalize the size value according to the dimensions of the canvas 
  //console.log(size); //Nur zum Debuggen
  return (size);  //return the size value of the shape
  // 0: tiniest possible; 1: largest possible
}