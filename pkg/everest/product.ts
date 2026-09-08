export function init($plugin: any, store: any) {
  const PRODUCT_NAME = 'everest';

  // ── Everest Operator CRDs (everest.percona.com) ──
  const DATABASE_CLUSTER          = 'everest.percona.com.databasecluster';
  const DATABASE_ENGINE           = 'everest.percona.com.databaseengine';
  const DATABASE_CLUSTER_BACKUP   = 'everest.percona.com.databaseclusterbackup';
  const DATABASE_CLUSTER_RESTORE  = 'everest.percona.com.databaseclusterrestore';
  const BACKUP_STORAGE            = 'everest.percona.com.backupstorage';
  const MONITORING_CONFIG         = 'everest.percona.com.monitoringconfig';
  const DATA_IMPORT_JOB           = 'everest.percona.com.dataimportjob';
  const DATA_IMPORTER             = 'everest.percona.com.dataimporter';
  const POD_SCHEDULING_POLICY     = 'everest.percona.com.podschedulingpolicy';
  const LOAD_BALANCER_CONFIG      = 'everest.percona.com.loadbalancerconfig';
  const SPLIT_HORIZON_DNS_CONFIG  = 'enginefeatures.everest.percona.com.splithorizondnsconfig';

  // ── MySQL / PXC CRDs (pxc.percona.com) ──
  const PXC_CLUSTER   = 'pxc.percona.com.perconaxtradbcluster';
  const PXC_BACKUP    = 'pxc.percona.com.perconaxtradbclusterbackup';
  const PXC_RESTORE   = 'pxc.percona.com.perconaxtradbclusterrestore';

  // ── MongoDB CRDs (psmdb.percona.com) ──
  const PSMDB_CLUSTER = 'psmdb.percona.com.perconaservermongodb';
  const PSMDB_BACKUP  = 'psmdb.percona.com.perconaservermongodbbackup';
  const PSMDB_RESTORE = 'psmdb.percona.com.perconaservermongodbrestore';

  // ── PostgreSQL CRDs (pgv2.percona.com) ──
  const PG_CLUSTER = 'pgv2.percona.com.perconapgcluster';
  const PG_BACKUP  = 'pgv2.percona.com.perconapgbackup';
  const PG_RESTORE = 'pgv2.percona.com.perconapgrestore';

  const {
    product,
    configureType,
    basicType,
  } = $plugin.DSL(store, PRODUCT_NAME);

  // ── Top-level product definition ──
  product({
    // Hide the product when this cluster does not expose Everest's landing resource.
    ifHaveType: DATABASE_CLUSTER,
    icon:       'globe',
    inStore:    'cluster',
    weight:     96,
    to:         {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: {
        product:  PRODUCT_NAME,
        resource: DATABASE_CLUSTER
      }
    }
  });

  // ── Helper to configure all types uniformly ──
  const allTypes = [
    { type: DATABASE_CLUSTER,         displayName: 'Database Cluster' },
    { type: DATABASE_ENGINE,           displayName: 'Database Engine' },
    { type: DATABASE_CLUSTER_BACKUP,  displayName: 'Database Cluster Backup' },
    { type: DATABASE_CLUSTER_RESTORE, displayName: 'Database Cluster Restore' },
    { type: BACKUP_STORAGE,            displayName: 'Backup Storage' },
    { type: MONITORING_CONFIG,         displayName: 'Monitoring Config' },
    { type: DATA_IMPORT_JOB,           displayName: 'Data Import Job' },
    { type: DATA_IMPORTER,             displayName: 'Data Importer' },
    { type: POD_SCHEDULING_POLICY,     displayName: 'Pod Scheduling Policy' },
    { type: LOAD_BALANCER_CONFIG,      displayName: 'Load Balancer Config' },
    { type: SPLIT_HORIZON_DNS_CONFIG,  displayName: 'Split Horizon DNS Config' },
    { type: PXC_CLUSTER,  displayName: 'PXC Cluster' },
    { type: PXC_BACKUP,   displayName: 'PXC Backup' },
    { type: PXC_RESTORE,  displayName: 'PXC Restore' },
    { type: PSMDB_CLUSTER, displayName: 'PSMDB Cluster' },
    { type: PSMDB_BACKUP,  displayName: 'PSMDB Backup' },
    { type: PSMDB_RESTORE, displayName: 'PSMDB Restore' },
    { type: PG_CLUSTER, displayName: 'PG Cluster' },
    { type: PG_BACKUP,  displayName: 'PG Backup' },
    { type: PG_RESTORE, displayName: 'PG Restore' },
  ];

  for (const { type, displayName } of allTypes) {
    configureType(type, {
      displayName,
      isCreatable: true,
      isEditable:  true,
      isRemovable: true,
      showAge:     true,
      showState:   true,
      canYaml:     true,
    });
  }

  // ── Sidebar menu groups ──

  // "Everest Objects" group — Everest's own CRDs
  basicType([
    DATABASE_CLUSTER,
    DATABASE_ENGINE,
    DATABASE_CLUSTER_BACKUP,
    DATABASE_CLUSTER_RESTORE,
    BACKUP_STORAGE,
    MONITORING_CONFIG,
    DATA_IMPORT_JOB,
    DATA_IMPORTER,
    POD_SCHEDULING_POLICY,
    LOAD_BALANCER_CONFIG,
    SPLIT_HORIZON_DNS_CONFIG,
  ], 'Everest Objects');

  // "MySQL" group — PXC operator CRDs
  basicType([
    PXC_CLUSTER,
    PXC_BACKUP,
    PXC_RESTORE,
  ], 'MySQL');

  // "MongoDB" group — PSMDB operator CRDs
  basicType([
    PSMDB_CLUSTER,
    PSMDB_BACKUP,
    PSMDB_RESTORE,
  ], 'MongoDB');

  // "PostgreSQL" group — PG operator CRDs
  basicType([
    PG_CLUSTER,
    PG_BACKUP,
    PG_RESTORE,
  ], 'PostgreSQL');
}
