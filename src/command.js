
class Command {

  commands = [];

  attack(unit, target) {
    if ((unit.order.abilityId === 23) && (unit.order.targetUnitTag === target.tag)) return;

    this.commands.push({ unitTags: [unit.tag], abilityId: 23, targetUnitTag: target.tag });
  }

  follow(unit, target) {
    if (target.health < target.healthMax) {
      if ((unit.order.abilityId === 3685) && (unit.order.targetUnitTag === target.tag)) return;

      this.commands.push({ unitTags: [unit.tag], abilityId: 3685, targetUnitTag: target.tag });
    } else {
      if ((unit.order.abilityId === 16) && (unit.order.targetUnitTag === target.tag)) return;

      this.commands.push({ unitTags: [unit.tag], abilityId: 16, targetUnitTag: target.tag });
    }
  }

  harvest(unit, resource) {
    if ((unit.order.abilityId === 295) && (unit.order.targetUnitTag === resource.tag)) return;

    this.commands.push({ unitTags: [unit.tag], abilityId: 295, targetUnitTag: resource.tag });
  }

  align(unit, via, resource) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 16, targetWorldSpacePos: { x: via.x, y: via.y } });
    this.commands.push({ unitTags: [unit.tag], abilityId: 295, targetUnitTag: resource.tag, queueCommand: true });
  }

  head(units, resource) {
    const unitTags = [];

    for (const unit of units) {
      if ((unit.order.abilityId === 295) && (unit.order.targetUnitTag === resource.tag)) continue;

      unitTags.push(unit.tag);
    }

    if (unitTags.length) {
      this.commands.push({ unitTags, abilityId: 295, targetUnitTag: resource.tag });
    }
  }

  move(unit, pos) {
    if ((unit.order.abilityId === 16) && unit.order.targetWorldSpacePos && (unit.order.targetWorldSpacePos.x === pos.x) && (unit.order.targetWorldSpacePos.y === pos.y)) return;

    this.commands.push({ unitTags: [unit.tag], abilityId: 16, targetWorldSpacePos: pos });
  }

  repair(unit, target) {
    if ((unit.order.abilityId === 3685) && (unit.order.targetUnitTag === target.tag)) return;

    this.commands.push({ unitTags: [unit.tag], abilityId: 3685, targetUnitTag: target.tag });
  }

  stop(unit) {
    if (!unit.order.abilityId) return;

    this.commands.push({ unitTags: [unit.tag], abilityId: 3665 });
  }

  strike(units, target, resource) {
    this.commands.push({ unitTags: units.map(unit => unit.tag), abilityId: 23, targetUnitTag: target.tag });
    this.commands.push({ unitTags: units.map(unit => unit.tag), abilityId: 295, targetUnitTag: resource.tag, queueCommand: true });
  }

  clear() {
    this.commands.length = 0;
  }

  actions() {
   for (const command of this.commands) {
     console.log("[command]", JSON.stringify(command));
   }

    return this.commands.map(command => ({ actionRaw: { unitCommand: command } }));
  }

}

export default new Command();
