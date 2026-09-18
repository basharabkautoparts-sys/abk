-- Preserve the category slug and every existing product association.
-- Only upgrade the original seed label; preserve subsequent custom admin edits.
update public.part_categories
set name = 'Body & Interior Parts',
    description = case
      when description = 'Lamps, mirrors, panels, grilles and exterior trim.'
      then 'Lamps, mirrors, panels, grilles, interior fittings and trim.'
      else description
    end
where slug = 'body-parts' and name = 'Body Parts';
