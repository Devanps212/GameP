const { fn } = require("moment")
const hbs = require('hbs')

//incriment Helper
const increase = function(index)
{
    return index+1
}

//Comparing Helper('if_eq')
const compare = function(a, b)
{
    if(a == b)
    {
        return true
    }
    else
    {
        return false
    }
}

//Text limiting 
const textLimit = function(text, maxlength) 
{
    if (text.length > maxlength)
    {
        text = text.substring(0, maxlength) + '....';
    }
    return text;
}

//Not equalt to

const NotEqualto = function(a, b)
{
    if(a !== b)
    {
        return true
    }
    else
    {
        return false
    }
}

//not the first element
const unlessFirst = function(index, options)
{
    if(index !== 0)
    {
        return options.fn(this)
    }
    else
    {
        return options.inverse(this)
    }
}
  const check = function(product, selectedCategory, selectedSearchQuery, options) {
    if ((!selectedCategory || product.category === selectedCategory) &&
        (!selectedSearchQuery || product.name.match(new RegExp(selectedSearchQuery, 'i')) || product.price.match(new RegExp(selectedSearchQuery, 'i')))) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
 const ifeq = function(a, b, options)
 {
     if(a === b)
     {
         return options.fn(this)
     }
     else
     {
         return options.inverse(this)
     }
 }

 const pagination = function (currentPage, totalPage, searchQuery, sort) {
  
  const pages = [];
  const maxPageLinks = totalPage; // Maximum number of page links to display

  // Calculate the range of page links to display
  let startPage = Math.max(1, currentPage - Math.floor(maxPageLinks / 2));
  const endPage = Math.min(totalPage, startPage + maxPageLinks - 1);

  // Adjust startPage to ensure that maxPageLinks are displayed
  startPage = Math.max(1, endPage - maxPageLinks + 1);
  console.log("currentPage:", currentPage);
  console.log("startPage:", startPage);
  console.log("endPage:", endPage);

  // Generate the page links
  for (let i = startPage; i <= endPage; i++) {
    const isCurrent = i === currentPage;
    console.log(`Page ${i}: isCurrent=${isCurrent}`);
    pages.push({
      page: i,
      isCurrent: isCurrent,
    });
    console.log(`Page ${i}: isCurrent=${isCurrent}`);
  }
  let check = pages.some(pageItem => pageItem.isCurrent === true);
  console.log("check: ",check);
  console.log("current :", currentPage)

  

  // Prepare the pagination HTML
  const paginationHTML = `
    <ul class="pagination">
      ${currentPage > 1 ? `
        <li class="page-item">
          <a class="page-link" href="?page=${parseInt(currentPage) - 1}&search=${searchQuery}&sort=${sort}">Previous</a>
        </li>
      ` : ''}

      ${pages.map(pageItem => `
        <li class="page-item${pageItem.isCurrent ? ' active' : ''}">
          <a class="page-link${pageItem.isCurrent ? ' current-page' : ''}" href="?page=${pageItem.page}&search=${searchQuery}&sort=${sort}">${pageItem.page}</a>
        </a>
        </li>
      `).join('')}
      
      ${currentPage < totalPage ? `
        <li class="page-item">
          <a class="page-link" href="?page=${parseInt(currentPage) + 1}&search=${searchQuery}&sort=${sort}">Next</a>
        </li>
      ` : ''}
    </ul>
  `;


  return new hbs.SafeString(paginationHTML);
}

const currentpage = function (req) {
  const page = req.query.page || 1;
  return page;
}

const sessionCheck = function(options) {
  if (res.locals.Authenticated) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

const stringify = function (context) {
  return JSON.stringify(context);
}
const unless = function (conditional, options) {
  if (!conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}
const formatdate = function(date) {
  if (date instanceof Date && !isNaN(date)) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
  } else {
      return date; 
  }
}
module.exports = {
    unless,
    unlessFirst,
    formatdate,
    stringify,
    NotEqualto,
    sessionCheck,
    textLimit,
    increase,
    pagination, 
    currentpage,
    compare,
    check,
    ifeq
}
