/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@kbn/i18n';
import { Schemas } from '../../../src/legacy/core_plugins/vis_default_editor/public';
import { prepareJson, prepareString } from '../../../src/legacy/core_plugins/visualizations/public/np_ready/public/legacy/build_pipeline';

import tableVisTemplate from './enhanced-table-vis.html';
import { EnhancedTableVisualizationController } from './vis_controller';
import { enhancedTableRequestHandler } from './data_load/enhanced-table-request-handler';
import { documentTableResponseHandler } from './data_load/document-table-response-handler';
import { DocumentTableData } from './components/document_table_vis_data';
import { EnhancedTableOptions } from './components/enhanced_table_vis_options';


// define the visType object, which kibana will use to display and configure new Vis object of this type.
export const documentTableVisTypeDefinition = {
  type: 'table',
  name: 'document_table',
  title: i18n.translate('visTypeDocumentTable.visTitle', {
    defaultMessage: 'Document Table'
  }),
  icon: 'visTable',
  description: i18n.translate('visTypeDocumentTable.visDescription', {
    defaultMessage: 'Same functionality than Data Table, but for single documents (not aggregations) and with enhanced features like computed columns, filter bar and pivot table.'
  }),
  visualization: EnhancedTableVisualizationController,
  visConfig: {
    defaults: {
      perPage: 10,
      showPartialRows: false,
      showMetricsAtAllLevels: false,
      sort: {
        columnIndex: null,
        direction: null
      },
      showTotal: false,
      totalFunc: 'sum',
      computedColumns: [],
      computedColsPerSplitCol: false,
      hideExportLinks: false,
      stripedRows: false,
      showFilterBar: false,
      filterCaseSensitive: false,
      filterBarHideable: false,
      filterAsYouType: false,
      filterTermsSeparately: false,
      filterHighlightResults: false,
      filterBarWidth: '25%',
      /* document-table specific options*/
      fieldColumns: [
        {
          label: '',
          field: {
            name: '_source',
          },
          enabled: true
        }
      ],
      hitsSize: 10,
      sortField: {
        name: '_score',
      },
      sortOrder: 'desc'
    },
    template: tableVisTemplate
  },
  editorConfig: {
    optionTabs: [
      {
        name: 'fieldColumns',
        title: i18n.translate('visTypeDocumentTable.tabs.dataText', {
          defaultMessage: 'Data',
        }),
        editor: DocumentTableData
      },
      {
        name: 'options',
        title: i18n.translate('visTypeDocumentTable.tabs.optionsText', {
          defaultMessage: 'Options',
        }),
        editor: EnhancedTableOptions
      }
    ],
    schemas: new Schemas([])
  },
  requestHandler: enhancedTableRequestHandler,
  responseHandler: documentTableResponseHandler,
  hierarchicalData: function (vis) {
    return Boolean(vis.params.showPartialRows || vis.params.showMetricsAtAllLevels);
  },
  toExpression: function (vis) {
    const visConfig = { ...vis.params };
    const { indexPattern, aggs } = vis.data;
    let pipeline = `enhanced_table_visualization type='${vis.type.name}'
      ${prepareJson('visConfig', visConfig)}
      ${prepareJson('aggConfigs', aggs.aggs)}
      metricsAtAllLevels=${vis.isHierarchical()}
      partialRows=${vis.type.requiresPartialRows || vis.params.showPartialRows || false} `;
    if (indexPattern) {
      pipeline += `${prepareString('index', indexPattern.id)}`;
    }
    return pipeline;
  }
};
