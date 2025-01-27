export type TabParamList = {
  welcome: undefined;
  explore: undefined;
  home: undefined;
};

export type RootParamList = {
  '(tabs)': TabParamList;
  '+not-found': undefined;
};