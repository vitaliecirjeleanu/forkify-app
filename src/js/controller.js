import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    recipeView.renderSpinner();
    // 1) Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
    console.error(error);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search result
    await model.loadSearchResult(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render the initial pagiantion buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagiantion buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Succes messsage
    addRecipeView.renderMessage();

    // Render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Close window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('💣', error);
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  //publisher-subscriber pattern
  bookmarksView.addHandlerRander(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHanlderClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};
init();
