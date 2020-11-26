module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('buckets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      user_nick: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'users', key: 'nick' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('buckets');
  },
};
